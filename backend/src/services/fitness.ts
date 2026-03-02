import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";

/**
 * Evaluates the fitness of a timetable based on dynamic UI parameters.
 */
export function evaluateFitness(
  timetable: Timetable,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  config: TimetableConfig // We now pass the UI config in!
): number {
  const courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
  const roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));
  const timeslotMap = new Map<number, Timeslot>(timeslots.map((t) => [t.id, t]));

  let penalty = 0;
  
  // A base score to subtract penalties from. A perfect timetable equals 10,000.
  const BASE_SCORE = 10000; 
  const HARD_PENALTY = 5000; // Violating a hard constraint basically kills the timetable

  // Data tracking maps for efficient checking
  const roomTimeslotMap = new Map<string, number>(); // `${roomId}-${timeslotId}`
  const levelTimeslotMap = new Map<string, number>(); // `${level}-${timeslotId}`
  const examinerTimeslotMap = new Map<string, number>(); // `${lecturer}-${timeslotId}`
  const levelDateMap = new Map<string, number>(); // `${level}-${date}`

  // 1. ITERATE THROUGH ASSIGNMENTS TO BUILD MAPS & CHECK BASIC ROOM LOGIC
  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    const room = roomMap.get(assignment.roomId);
    const timeslot = timeslotMap.get(assignment.timeslotId);

    if (!course || !room || !timeslot) continue;

    // --- NON-NEGOTIABLE SYSTEM RULES ---
    // Rule: Two courses cannot be in the exact same room at the exact same time
    const roomTimeKey = `${room.id}-${timeslot.id}`;
    roomTimeslotMap.set(roomTimeKey, (roomTimeslotMap.get(roomTimeKey) || 0) + 1);

    // Rule: Cannot schedule an exam in a room under maintenance
    if (room.availability === 'Maintenance') {
      penalty += HARD_PENALTY;
    }

    // --- HARD CONSTRAINTS (Toggled by UI) ---
    // H1: Strict Room Capacity
    if (config.hard_constraints.roomCapacity && course.numStudents > room.capacity) {
      penalty += HARD_PENALTY;
    }

    // H2: Student Level Clash (e.g., Two 400L exams at the same time)
    if (config.hard_constraints.studentClash) {
      const levelTimeKey = `${course.level}-${timeslot.id}`;
      levelTimeslotMap.set(levelTimeKey, (levelTimeslotMap.get(levelTimeKey) || 0) + 1);
    }

    // H3: Chief Examiner Clash
    if (config.hard_constraints.chiefExaminerClash) {
      const examinerTimeKey = `${course.lecturer}-${timeslot.id}`;
      examinerTimeslotMap.set(examinerTimeKey, (examinerTimeslotMap.get(examinerTimeKey) || 0) + 1);
    }

    // --- SOFT CONSTRAINTS (Weighted by UI) ---
    // S1: Room Under-utilization (e.g., 50 students in a 500 capacity hall)
    if (room.capacity - course.numStudents > 100) {
      // Multiply the waste by the UI slider weight (1-10)
      penalty += (config.soft_constraints.roomUtilization * 5); 
    }

    // Track daily limits for Soft Constraint S2
    const levelDateKey = `${course.level}-${timeslot.date}`;
    levelDateMap.set(levelDateKey, (levelDateMap.get(levelDateKey) || 0) + 1);
  }

  // 2. APPLY AGGREGATE PENALTIES FROM MAPS
  
  // Apply System Rule: Room Double Booking
  for (const count of roomTimeslotMap.values()) {
    if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
  }

  // Apply Hard Constraint: Level Clashes
  if (config.hard_constraints.studentClash) {
    for (const count of levelTimeslotMap.values()) {
      if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
    }
  }

  // Apply Hard Constraint: Examiner Clashes
  if (config.hard_constraints.chiefExaminerClash) {
    for (const count of examinerTimeslotMap.values()) {
      if (count > 1) penalty += ((count - 1) * HARD_PENALTY);
    }
  }

  // Apply Soft Constraint: Daily Exam Limit
  for (const count of levelDateMap.values()) {
    if (count > config.soft_constraints.dailyLimit) {
      // If 400L has 3 exams in one day, and the limit is 2, apply the spread penalty weight
      penalty += ((count - config.soft_constraints.dailyLimit) * config.soft_constraints.examSpread * 50);
    }
  }

  // Calculate final fitness (Prevent negative scores, floor at 0)
  const finalFitness = Math.max(0, BASE_SCORE - penalty);
  
  // Return as a percentage (0 to 100) for the frontend Progress Bar
  return (finalFitness / BASE_SCORE) * 100; 
}