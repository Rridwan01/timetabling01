import { Timetable, ExamAssignment } from "../models/timetable";

interface Course {
  id: number;
  numStudents: number;
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
 * @returns Fitness score (higher is better).
 */
export function evaluateFitness(
  timetable: Timetable,
  courses: Course[],
  rooms: Room[]
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

  // Student clash (simplified)
  const timeslotCourseMap = new Map<number, Set<number>>(); // Key: timeslotId, Value: Set of courseIds
  for (const assignment of timetable.assignments) {
    if (!timeslotCourseMap.has(assignment.timeslotId)) {
      timeslotCourseMap.set(assignment.timeslotId, new Set());
    }
    timeslotCourseMap.get(assignment.timeslotId)?.add(assignment.courseId);
  }
  for (const [timeslotId, courseSet] of timeslotCourseMap) {
    const courseArray = Array.from(courseSet);
    for (let i = 0; i < courseArray.length; i++) {
      for (let j = i + 1; j < courseArray.length; j++) {
        // Simplified clash detection: assume all courses have overlapping students
        penalty += 50; // Penalty for each pair of clashing courses
      }
    }
  }

  // Fitness score (higher is better)
  const fitness = 1000 - penalty;
  return fitness;
}