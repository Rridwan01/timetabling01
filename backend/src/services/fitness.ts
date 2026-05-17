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
  
  if (!timetable || !timetable.assignments || timetable.assignments.length === 0) {
    return 0; 
  }
  
  if (courses.length !== cachedCoursesLength) {
    courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
    roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));
    timeslotMap = new Map<number, Timeslot>(timeslots.map((t) => [t.id, t]));
    cachedCoursesLength = courses.length;
  }

  let penalty = 0;
  
  // Massive base score so the algorithm can "feel" the difference between 5 clashes and 1 clash
  const BASE_SCORE = 1000000; 
  const HARD_PENALTY = 10000; 

  const roomTimeslotMap = new Map<string, number>(); 
  const levelTimeslotMap = new Map<string, number>(); 
  const examinerTimeslotMap = new Map<string, number>(); 
  const levelDateMap = new Map<string, Set<number>>(); 
  const levelDates = new Map<string, Set<string>>();

  const courseCapacityMap = new Map<string, { totalStudents: number, assignedCapacity: number, roomCount: number }>();
  const courseTimeslotTracker = new Map<number, Set<number>>();
  const roomUsageCount = new Map<number, number>();
  const courseRoomTimeslots = new Map<string, Set<number>>();

  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    const room = roomMap.get(assignment.roomId);
    const timeslot = timeslotMap.get(assignment.timeslotId);

    if (!course || !room || !timeslot) continue;

    if (!courseTimeslotTracker.has(course.id)) courseTimeslotTracker.set(course.id, new Set());
    courseTimeslotTracker.get(course.id)!.add(timeslot.id);

    const capacityKey = `${course.id}-${timeslot.id}`;
    if (!courseCapacityMap.has(capacityKey)) {
      courseCapacityMap.set(capacityKey, { totalStudents: course.numStudents, assignedCapacity: 0, roomCount: 0 });
    }
    const capData = courseCapacityMap.get(capacityKey)!;
    capData.assignedCapacity += room.capacity;
    capData.roomCount += 1;

    roomUsageCount.set(room.id, (roomUsageCount.get(room.id) || 0) + 1);

    const roomTimeKey = `${room.id}-${timeslot.id}-${assignment.courseId}`;
    roomTimeslotMap.set(roomTimeKey, 1); // Just mark it, don't count duplicates

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
    if (!levelDateMap.has(levelDateKey)) levelDateMap.set(levelDateKey, new Set());
    levelDateMap.get(levelDateKey)!.add(course.id);

    if (!levelDates.has(course.level)) levelDates.set(course.level, new Set());
    levelDates.get(course.level)!.add(timeslot.date);
  }

  for (const timeslots of courseTimeslotTracker.values()) {
    if (timeslots.size > 1) penalty += (HARD_PENALTY * 2); 
  }

  if (config.hard_constraints.roomCapacity) {
    for (const data of courseCapacityMap.values()) {
      if (data.totalStudents > data.assignedCapacity) {
        penalty += HARD_PENALTY;
      } else {
        const excessSpace = data.assignedCapacity - data.totalStudents;
        if (excessSpace > 50) { 
           penalty += (excessSpace * (config.soft_constraints.roomUtilization || 1) * 2);
        }
      }
      // Penalize fragmentation: unnecessary distribution across multiple halls
      if (data.roomCount > 1) {
         penalty += (data.roomCount * 100 * (config.soft_constraints.roomUtilization || 1));
      }
    }
  }

  // Penalize uneven venue utilization (balances out how often each room is used)
  for (const count of roomUsageCount.values()) {
    penalty += (count * count * 5 * (config.soft_constraints.roomUtilization || 1));
  }

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

  // Penalize cognitive load: multiple exams per day
  for (const uniqueCourses of levelDateMap.values()) {
    const count = uniqueCourses.size;
    if (count > (config.soft_constraints.dailyLimit || 2)) {
      penalty += ((count - (config.soft_constraints.dailyLimit || 2)) * (config.soft_constraints.examSpread || 5) * 100);
    }
  }

  // Penalize cognitive load: consecutive days spacing
  for (const dates of levelDates.values()) {
    const sortedDates = Array.from(dates).map(d => new Date(d).getTime()).sort((a,b) => a - b);
    for (let i = 1; i < sortedDates.length; i++) {
       const diffDays = Math.round((sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24));
       if (diffDays === 1) { // Consecutive days
          penalty += ((config.soft_constraints.examSpread || 5) * 50); 
       }
    }
  }

  const finalFitness = Math.max(0, BASE_SCORE - penalty);
  return (finalFitness / BASE_SCORE) * 100; 
}