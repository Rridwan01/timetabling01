import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";

let cachedCoursesLength = -1;
let courseMap = new Map<number, Course>();
let roomMap = new Map<number, Room>();
let timeslotMap = new Map<number, Timeslot>();

export function evaluateFitness(
  timetable: Timetable,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  config: TimetableConfig 
): number {
  
  if (courses.length !== cachedCoursesLength) {
    courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
    roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));
    timeslotMap = new Map<number, Timeslot>(timeslots.map((t) => [t.id, t]));
    cachedCoursesLength = courses.length;
  }

  let penalty = 0;
  const BASE_SCORE = 10000; 
  const HARD_PENALTY = 5000; 

  const roomTimeslotMap = new Map<string, number>(); 
  const levelTimeslotMap = new Map<string, number>(); 
  const examinerTimeslotMap = new Map<string, number>(); 
  const levelDateMap = new Map<string, number>(); 

  // --- NEW: Tracking for Course Splitting ---
  const courseCapacityMap = new Map<string, { totalStudents: number, assignedCapacity: number }>();
  const courseTimeslotTracker = new Map<number, Set<number>>();

  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    const room = roomMap.get(assignment.roomId);
    const timeslot = timeslotMap.get(assignment.timeslotId);

    if (!course || !room || !timeslot) continue;

    // 1. Ensure the exam is not scheduled on multiple different days/times
    if (!courseTimeslotTracker.has(course.id)) courseTimeslotTracker.set(course.id, new Set());
    courseTimeslotTracker.get(course.id)!.add(timeslot.id);

    // 2. Group room capacities together for the same course and timeslot
    const capacityKey = `${course.id}-${timeslot.id}`;
    if (!courseCapacityMap.has(capacityKey)) {
      courseCapacityMap.set(capacityKey, { totalStudents: course.numStudents, assignedCapacity: 0 });
    }
    courseCapacityMap.get(capacityKey)!.assignedCapacity += room.capacity;

    // 3. Normal Constraints
    const roomTimeKey = `${room.id}-${timeslot.id}`;
    roomTimeslotMap.set(roomTimeKey, (roomTimeslotMap.get(roomTimeKey) || 0) + 1);

    if (room.availability === 'Maintenance') penalty += HARD_PENALTY;

    if (config.hard_constraints.studentClash) {
      const levelTimeKey = `${course.level}-${timeslot.id}`;
      levelTimeslotMap.set(levelTimeKey, (levelTimeslotMap.get(levelTimeKey) || 0) + 1);
    }

    if (config.hard_constraints.chiefExaminerClash) {
      const examinerTimeKey = `${course.lecturer}-${timeslot.id}`;
      examinerTimeslotMap.set(examinerTimeKey, (examinerTimeslotMap.get(examinerTimeKey) || 0) + 1);
    }

    const levelDateKey = `${course.level}-${timeslot.date}`;
    levelDateMap.set(levelDateKey, (levelDateMap.get(levelDateKey) || 0) + 1);
  }

  // --- APPLY PENALTIES ---

  // EXTREME PENALTY: Exam split across multiple timeslots
  for (const timeslots of courseTimeslotTracker.values()) {
    if (timeslots.size > 1) penalty += (HARD_PENALTY * 2); 
  }

  // HARD PENALTY: Capacity Check (Now correctly adds up multiple rooms!)
  if (config.hard_constraints.roomCapacity) {
    for (const data of courseCapacityMap.values()) {
      if (data.totalStudents > data.assignedCapacity) {
        penalty += HARD_PENALTY;
      }
    }
  }

  // Double-booked rooms
  for (const count of roomTimeslotMap.values()) {
    if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
  }

  // Student level clashes
  if (config.hard_constraints.studentClash) {
    for (const count of levelTimeslotMap.values()) {
      if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
    }
  }

  // Chief Examiner clashes
  if (config.hard_constraints.chiefExaminerClash) {
    for (const count of examinerTimeslotMap.values()) {
      if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
    }
  }

  // Soft Penalty: Exam spread
  for (const count of levelDateMap.values()) {
    if (count > config.soft_constraints.dailyLimit) {
      penalty += ((count - config.soft_constraints.dailyLimit) * config.soft_constraints.examSpread * 50);
    }
  }

  const finalFitness = Math.max(0, BASE_SCORE - penalty);
  return (finalFitness / BASE_SCORE) * 100; 
}