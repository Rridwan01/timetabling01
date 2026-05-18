// backend/src/services/fitness.ts
import { Timetable, Course, Room, Timeslot, TimetableConfig, ExamAssignment, ConflictMatrix } from "../models/timetable";

// --- Global Caches ---
let cachedCoursesLength = -1;
let courseMap = new Map<number, Course>();
let roomMap = new Map<number, Room>();
let timeslotMap = new Map<number, Timeslot>();

// NEW: ID Boundaries for Typed Arrays
let maxRoomId = 0;
let maxTimeslotId = 0;
let maxCourseId = 0;

// NEW: Lecturer string-to-int mapping for fast clash detection
let lecturerToIntMap = new Map<string, number>();
let maxLecturerId = 0;

export function evaluateFitness(
  timetable: Timetable,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  config: TimetableConfig,
  conflictMatrix: ConflictMatrix 
): number {
  
  if (!timetable || !timetable.courseAssignments) return 0; 
  
  const flatAssignments: ExamAssignment[] = [];
  const scheduledCourseIds = new Set<number>();

  for (const courseId in timetable.courseAssignments) {
    const id = Number(courseId);
    scheduledCourseIds.add(id);
    flatAssignments.push(...timetable.courseAssignments[id]);
  }

  if (flatAssignments.length === 0) return 0;
  
  // CACHE HYDRATION (Only runs once when data changes)
  if (courses.length !== cachedCoursesLength) {
    courseMap.clear();
    lecturerToIntMap.clear();
    maxLecturerId = 0;

    courses.forEach(c => {
        courseMap.set(c.id, c);
        if (!lecturerToIntMap.has(c.lecturer)) {
            lecturerToIntMap.set(c.lecturer, ++maxLecturerId);
        }
    });

    roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));
    timeslotMap = new Map<number, Timeslot>(timeslots.map((t) => [t.id, t]));
    
    maxRoomId = Math.max(...rooms.map(r => r.id), 0);
    maxTimeslotId = Math.max(...timeslots.map(t => t.id), 0);
    maxCourseId = Math.max(...courses.map(c => c.id), 0);
    
    cachedCoursesLength = courses.length;
  }

  let penalty = 0;
  const BASE_SCORE = 1000000; 
  const HARD_PENALTY = 10000; 

  // 1. Missing Course Penalty
  let missingCourses = 0;
  for (const course of courses) {
      if (!scheduledCourseIds.has(course.id)) missingCourses++;
  }
  if (missingCourses > 0) penalty += (missingCourses * HARD_PENALTY * 10);

  // ============================================================================
  // CRITICAL FIX: TYPED ARRAYS FOR BLAZING FAST CONSTRAINT TRACKING
  // Eliminates all string interpolation (e.g. `${room}-${time}`) and Map allocations
  // ============================================================================
  
  // 1D Array simulating a 2D Grid: grid[room][timeslot]
  const roomTimeslotGrid = new Int32Array((maxRoomId + 1) * (maxTimeslotId + 1));
  const examinerTimeslotGrid = new Int32Array((maxLecturerId + 1) * (maxTimeslotId + 1));
  
  const roomUsageCount = new Int32Array(maxRoomId + 1);
  const courseTimeslotTracker = new Map<number, Set<number>>();
  const timeslotCourseTracker = new Map<number, Set<number>>();

  const courseCapacityAssigned = new Int32Array((maxCourseId + 1) * (maxTimeslotId + 1));
  const courseRoomCount = new Int32Array((maxCourseId + 1) * (maxTimeslotId + 1));

  // --- FAST ITERATION LOOP ---
  for (const assignment of flatAssignments) {
    const course = courseMap.get(assignment.courseId)!;
    const room = roomMap.get(assignment.roomId)!;
    
    // Fast 1D Indexing Math: index = (Y * width) + X
    const roomTimeIndex = (room.id * (maxTimeslotId + 1)) + assignment.timeslotId;
    const capacityIndex = (course.id * (maxTimeslotId + 1)) + assignment.timeslotId;
    const lecturerId = lecturerToIntMap.get(course.lecturer)!;
    const examinerTimeIndex = (lecturerId * (maxTimeslotId + 1)) + assignment.timeslotId;

    // 1. Track double booking of rooms
    roomTimeslotGrid[roomTimeIndex]++;
    
    // 2. Track room usage balancing
    roomUsageCount[room.id]++;
    
    // 3. Track examiner clashes
    if (config.hard_constraints?.chiefExaminerClash) {
        examinerTimeslotGrid[examinerTimeIndex]++;
    }

    // 4. Capacity Tracking
    courseCapacityAssigned[capacityIndex] += room.capacity;
    courseRoomCount[capacityIndex]++;

    // 5. Track for Student Matrix
    if (!timeslotCourseTracker.has(assignment.timeslotId)) timeslotCourseTracker.set(assignment.timeslotId, new Set());
    timeslotCourseTracker.get(assignment.timeslotId)!.add(course.id);

    if (!courseTimeslotTracker.has(course.id)) courseTimeslotTracker.set(course.id, new Set());
    courseTimeslotTracker.get(course.id)!.add(assignment.timeslotId);

    if (room.availability === 'Maintenance') penalty += HARD_PENALTY;
  }

  // --- FAST PENALTY CALCULATION ---

  // Room Double Booking Penalty
  for (let i = 0; i < roomTimeslotGrid.length; i++) {
      if (roomTimeslotGrid[i] > 1) {
          penalty += ((roomTimeslotGrid[i] - 1) * HARD_PENALTY);
      }
  }

  // Examiner Clash Penalty
  if (config.hard_constraints?.chiefExaminerClash) {
      for (let i = 0; i < examinerTimeslotGrid.length; i++) {
          if (examinerTimeslotGrid[i] > 1) {
              penalty += ((examinerTimeslotGrid[i] - 1) * HARD_PENALTY);
          }
      }
  }

  // Room Overuse (Soft Constraint)
  for (let i = 0; i < roomUsageCount.length; i++) {
      if (roomUsageCount[i] > 0) {
          penalty += (roomUsageCount[i] * roomUsageCount[i] * 5 * (config.soft_constraints?.roomUtilization || 1));
      }
  }

  // Capacity Penalty
  if (config.hard_constraints?.roomCapacity) {
      for (const course of courses) {
          for (let tId = 0; tId <= maxTimeslotId; tId++) {
              const capIndex = (course.id * (maxTimeslotId + 1)) + tId;
              const assignedCap = courseCapacityAssigned[capIndex];
              const roomsUsed = courseRoomCount[capIndex];
              
              if (assignedCap > 0) {
                  if (course.numStudents > assignedCap) {
                      penalty += HARD_PENALTY; // Not enough seats
                  } else {
                      const excessSpace = assignedCap - course.numStudents;
                      if (excessSpace > 50) { 
                         penalty += (excessSpace * (config.soft_constraints?.roomUtilization || 1) * 2);
                      }
                  }
                  if (roomsUsed > 1) {
                     penalty += (roomsUsed * 100 * (config.soft_constraints?.roomUtilization || 1));
                  }
              }
          }
      }
  }

  // Student Matrix Clash Penalty
  if (config.hard_constraints?.studentClash) {
      for (const coursesInSlot of timeslotCourseTracker.values()) {
          const courseArray = Array.from(coursesInSlot);
          for (let i = 0; i < courseArray.length; i++) {
              for (let j = i + 1; j < courseArray.length; j++) {
                  const overlap = conflictMatrix[courseArray[i]][courseArray[j]] || 0;
                  if (overlap > 0) penalty += (overlap * HARD_PENALTY);
              }
          }
      }
  }

  // Course Split Penalty (Same course spread across different timeslots)
  for (const timeslots of courseTimeslotTracker.values()) {
    if (timeslots.size > 1) penalty += (HARD_PENALTY * 2); 
  }

  const finalFitness = Math.max(0, BASE_SCORE - penalty);
  return (finalFitness / BASE_SCORE) * 100; 
}