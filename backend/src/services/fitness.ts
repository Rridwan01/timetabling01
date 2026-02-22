import { Timetable, ExamAssignment, Timeslot } from "../models/timetable";

interface Course {
  id: number;
  numStudents: number;
  deptId: number; // Assuming deptId is part of the course object
}

interface Room {
  id: number;
  capacity: number;
}

/**
 * Evaluates the fitness of a timetable based on penalties for constraint violations.
 * @param timetable The timetable to evaluate.
 * @param courses List of courses.
 * @param rooms List of rooms.
 * @param timeslots List of timeslots.
 * @returns Fitness score (higher is better).
 */
export function evaluateFitness(
  timetable: Timetable,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[] // Add timeslots as a parameter
): number {
  const courseMap = new Map<number, Course>(
    courses.map((course) => [course.id, course])
  );
  const roomMap = new Map<number, Room>(rooms.map((room) => [room.id, room]));

  let penalty = 0;

  // Room capacity violation
  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    const room = roomMap.get(assignment.roomId);

    if (course && room && course.numStudents > room.capacity) {
      penalty += (course.numStudents - room.capacity) * 10; // Penalty for exceeding room capacity
    }
  }

  // Room conflict
  const roomTimeslotMap = new Map<string, number>(); // Key: `${roomId}-${timeslotId}`
  for (const assignment of timetable.assignments) {
    const key = `${assignment.roomId}-${assignment.timeslotId}`;
    roomTimeslotMap.set(key, (roomTimeslotMap.get(key) || 0) + 1);
  }
  for (const [key, count] of roomTimeslotMap) {
    if (count > 1) {
      penalty += (count - 1) * 100; // Large penalty for room conflicts
    }
  }

  // Refined Student Clash logic
  const timeslotDeptMap = new Map<number, Map<number, number>>(); // Key: timeslotId -> Map<deptId, count>
  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    if (!course) continue;

    const deptId = course.deptId; // Assuming deptId is part of the course object
    if (!timeslotDeptMap.has(assignment.timeslotId)) {
      timeslotDeptMap.set(assignment.timeslotId, new Map());
    }

    const deptMap = timeslotDeptMap.get(assignment.timeslotId)!;
    deptMap.set(deptId, (deptMap.get(deptId) || 0) + 1);
  }

  for (const [timeslotId, deptMap] of timeslotDeptMap) {
    for (const [deptId, count] of deptMap) {
      if (count > 1) {
        penalty += (count - 1) * 100; // Penalty for student clashes within the same department
      }
    }
  }

  // Soft Constraint: Small Gaps
  const dayDeptMap = new Map<string, Map<number, number>>(); // Key: date -> Map<deptId, count>
  for (const assignment of timetable.assignments) {
    const course = courseMap.get(assignment.courseId);
    if (!course) continue;

    const timeslot = timeslots.find((t: Timeslot) => t.id === assignment.timeslotId);
    if (!timeslot) continue;

    const date = timeslot.date;
    const deptId = course.deptId;

    if (!dayDeptMap.has(date)) {
      dayDeptMap.set(date, new Map());
    }

    const deptMap = dayDeptMap.get(date)!;
    deptMap.set(deptId, (deptMap.get(deptId) || 0) + 1);
  }

  for (const [date, deptMap] of dayDeptMap) {
    for (const [deptId, count] of deptMap) {
      if (count > 2) {
        penalty += (count - 2) * 20; // Penalty for more than two exams per department on the same day
      }
    }
  }

  // Fitness score (higher is better)
  const fitness = 1000 - penalty;
  return fitness;
}