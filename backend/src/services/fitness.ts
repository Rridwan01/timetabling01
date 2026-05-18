// backend/src/services/fitness.ts
import {
  Timetable,
  Course,
  Room,
  Timeslot,
  TimetableConfig,
  ExamAssignment,
  ConflictMatrix,
} from "../models/timetable";

// --- Global Caches ---
let cachedCoursesLength = -1;
let courseMap = new Map<number, Course>();
let roomMap = new Map<number, Room>();
let timeslotMap = new Map<number, Timeslot>();

// ID Boundaries for Typed Arrays
let maxRoomId = 0;
let maxTimeslotId = 0;
let maxCourseId = 0;
let lecturerToIntMap = new Map<string, number>();
let maxLecturerId = 0;

export function evaluateFitness(
  timetable: Timetable,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  config: TimetableConfig,
  conflictMatrix: ConflictMatrix,
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

  if (courses.length !== cachedCoursesLength) {
    courseMap.clear();
    lecturerToIntMap.clear();
    maxLecturerId = 0;

    courses.forEach((c) => {
      courseMap.set(c.id, c);
      const lecturerName = c.lecturer || "Unknown";
      if (!lecturerToIntMap.has(lecturerName)) {
        lecturerToIntMap.set(lecturerName, ++maxLecturerId);
      }
    });

    roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));
    timeslotMap = new Map<number, Timeslot>(timeslots.map((t) => [t.id, t]));

    maxRoomId = Math.max(...rooms.map((r) => r.id), 0);
    maxTimeslotId = Math.max(...timeslots.map((t) => t.id), 0);
    maxCourseId = Math.max(...courses.map((c) => c.id), 0);

    cachedCoursesLength = courses.length;
  }

  let penalty = 0;
  const BASE_SCORE = 1000000;
  const HARD_PENALTY = 10000;

  let missingCourses = 0;
  for (const course of courses) {
    if (!scheduledCourseIds.has(course.id)) missingCourses++;
  }
  if (missingCourses > 0) penalty += missingCourses * HARD_PENALTY * 10;

  const roomTimeslotGrid = new Int32Array(
    (maxRoomId + 1) * (maxTimeslotId + 1),
  );
  const examinerTimeslotGrid = new Int32Array(
    (maxLecturerId + 1) * (maxTimeslotId + 1),
  );
  const roomUsageCount = new Int32Array(maxRoomId + 1);
  const courseTimeslotTracker = new Map<number, Set<number>>();
  const timeslotCourseTracker = new Map<number, Set<number>>();
  const courseCapacityAssigned = new Int32Array(
    (maxCourseId + 1) * (maxTimeslotId + 1),
  );
  const courseRoomCount = new Int32Array(
    (maxCourseId + 1) * (maxTimeslotId + 1),
  );

  for (const assignment of flatAssignments) {
    const course = courseMap.get(assignment.courseId);
    const room = roomMap.get(assignment.roomId);
    if (!course || !room || assignment.timeslotId == null) continue; // Safety skip

    const roomTimeIndex = room.id * (maxTimeslotId + 1) + assignment.timeslotId;
    const capacityIndex =
      course.id * (maxTimeslotId + 1) + assignment.timeslotId;

    const lecturerName = course.lecturer || "Unknown";
    const lecturerId = lecturerToIntMap.get(lecturerName) || 0;
    const examinerTimeIndex =
      lecturerId * (maxTimeslotId + 1) + assignment.timeslotId;

    roomTimeslotGrid[roomTimeIndex]++;
    roomUsageCount[room.id]++;

    if (config.hard_constraints?.chiefExaminerClash) {
      examinerTimeslotGrid[examinerTimeIndex]++;
    }

    courseCapacityAssigned[capacityIndex] += room.capacity || 30;
    courseRoomCount[capacityIndex]++;

    if (!timeslotCourseTracker.has(assignment.timeslotId))
      timeslotCourseTracker.set(assignment.timeslotId, new Set());
    timeslotCourseTracker.get(assignment.timeslotId)!.add(course.id);

    if (!courseTimeslotTracker.has(course.id))
      courseTimeslotTracker.set(course.id, new Set());
    courseTimeslotTracker.get(course.id)!.add(assignment.timeslotId);

    if (room.availability === "Maintenance") penalty += HARD_PENALTY;
  }

  for (let i = 0; i < roomTimeslotGrid.length; i++) {
    if (roomTimeslotGrid[i] > 1)
      penalty += (roomTimeslotGrid[i] - 1) * HARD_PENALTY;
  }

  if (config.hard_constraints?.chiefExaminerClash) {
    for (let i = 0; i < examinerTimeslotGrid.length; i++) {
      if (examinerTimeslotGrid[i] > 1)
        penalty += (examinerTimeslotGrid[i] - 1) * HARD_PENALTY;
    }
  }

  let totalUsage = 0;
  for (let count of roomUsageCount) totalUsage += count;
  const meanUsage = totalUsage / (maxRoomId || 1);
  let varianceSum = 0;

  for (let i = 1; i <= maxRoomId; i++) {
    if (roomMap.has(i)) {
      const diff = roomUsageCount[i] - meanUsage;
      varianceSum += diff * diff;
    }
  }
  const venueVariance = varianceSum / (maxRoomId || 1);
  penalty +=
    venueVariance * 50 * (config.soft_constraints?.roomUtilization || 1);

  if (config.hard_constraints?.roomCapacity) {
    for (const course of courses) {
      const numStudents = course.numStudents || 30; // Fallback to prevent NaN

      for (let tId = 0; tId <= maxTimeslotId; tId++) {
        const capIndex = course.id * (maxTimeslotId + 1) + tId;
        const assignedCap = courseCapacityAssigned[capIndex];
        const roomsUsed = courseRoomCount[capIndex];

        if (assignedCap > 0) {
          if (numStudents > assignedCap) {
            penalty += HARD_PENALTY * (1 + (numStudents - assignedCap) / 100);
          } else {
            const excessSpace = assignedCap - numStudents;
            const occupancyRate = numStudents / assignedCap;

            if (occupancyRate < 0.5) {
              penalty +=
                excessSpace *
                10 *
                (config.soft_constraints?.roomUtilization || 1);
            }

            if (roomsUsed > 1) {
              const avgCapPerRoom = assignedCap / roomsUsed;
              if (numStudents <= avgCapPerRoom * (roomsUsed - 1)) {
                penalty +=
                  roomsUsed *
                  500 *
                  (config.soft_constraints?.roomUtilization || 1);
              } else {
                penalty += roomsUsed * 50;
              }
            }
          }
        }
      }
    }
  }

  // FIXED: Safe conflict matrix traversal to prevent backend crash
  if (config.hard_constraints?.studentClash && conflictMatrix) {
    for (const coursesInSlot of timeslotCourseTracker.values()) {
      const courseArray = Array.from(coursesInSlot);
      for (let i = 0; i < courseArray.length; i++) {
        for (let j = i + 1; j < courseArray.length; j++) {
          const row = conflictMatrix[courseArray[i]];
          const overlap = row ? row[courseArray[j]] || 0 : 0;
          if (overlap > 0) penalty += overlap * HARD_PENALTY;
        }
      }
    }
  }

  for (const timeslots of courseTimeslotTracker.values()) {
    if (timeslots.size > 1) penalty += HARD_PENALTY * 2;
  }

  const finalFitness = Math.max(0, BASE_SCORE - penalty);
  const percentScore = (finalFitness / BASE_SCORE) * 100;

  // Final safeguard against UI breaking
  return isNaN(percentScore) ? 0 : percentScore;
}
