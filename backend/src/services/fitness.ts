import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";

// --- GLOBAL MEMORY CACHE ---
// This prevents Node.js from running out of RAM by reusing the maps!
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
  
  // Only rebuild the maps if the database data has changed
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

  // 1. ITERATE THROUGH ASSIGNMENTS
  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    const room = roomMap.get(assignment.roomId);
    const timeslot = timeslotMap.get(assignment.timeslotId);

    if (!course || !room || !timeslot) continue;

    const roomTimeKey = `${room.id}-${timeslot.id}`;
    roomTimeslotMap.set(roomTimeKey, (roomTimeslotMap.get(roomTimeKey) || 0) + 1);

    if (room.availability === 'Maintenance') {
      penalty += HARD_PENALTY;
    }

    if (config.hard_constraints.roomCapacity && course.numStudents > room.capacity) {
      penalty += HARD_PENALTY;
    }

    if (config.hard_constraints.studentClash) {
      const levelTimeKey = `${course.level}-${timeslot.id}`;
      levelTimeslotMap.set(levelTimeKey, (levelTimeslotMap.get(levelTimeKey) || 0) + 1);
    }

    if (config.hard_constraints.chiefExaminerClash) {
      const examinerTimeKey = `${course.lecturer}-${timeslot.id}`;
      examinerTimeslotMap.set(examinerTimeKey, (examinerTimeslotMap.get(examinerTimeKey) || 0) + 1);
    }

    if (room.capacity - course.numStudents > 100) {
      penalty += (config.soft_constraints.roomUtilization * 5); 
    }

    const levelDateKey = `${course.level}-${timeslot.date}`;
    levelDateMap.set(levelDateKey, (levelDateMap.get(levelDateKey) || 0) + 1);
  }

  // 2. APPLY PENALTIES
  for (const count of roomTimeslotMap.values()) {
    if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
  }

  if (config.hard_constraints.studentClash) {
    for (const count of levelTimeslotMap.values()) {
      if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
    }
  }

  if (config.hard_constraints.chiefExaminerClash) {
    for (const count of examinerTimeslotMap.values()) {
      if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
    }
  }

  for (const count of levelDateMap.values()) {
    if (count > config.soft_constraints.dailyLimit) {
      penalty += ((count - config.soft_constraints.dailyLimit) * config.soft_constraints.examSpread * 50);
    }
  }

  const finalFitness = Math.max(0, BASE_SCORE - penalty);
  return (finalFitness / BASE_SCORE) * 100; 
}