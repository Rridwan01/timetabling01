import {
  Timetable,
  Course,
  Room,
  Timeslot,
  ExamAssignment,
} from "../models/timetable";

/**
 * Generates a random initial timetable using a Best Fit Decreasing heuristic.
 */
export function generateRandomTimetable(
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
): Timetable {
  const courseAssignments: Record<number, ExamAssignment[]> = {};
  const availableRooms = rooms.filter((r) => r.availability === "Available");

  // Anti-Fragmentation: Sort rooms by capacity (largest first)
  const sortedRooms = [...availableRooms].sort(
    (a, b) => b.capacity - a.capacity,
  );

  for (const course of courses) {
    const randomTimeslot =
      timeslots[Math.floor(Math.random() * timeslots.length)];
    let unassignedStudents = course.numStudents;
    const assignmentsForCourse: ExamAssignment[] = [];

    for (const room of sortedRooms) {
      if (unassignedStudents <= 0) break; // Stop when everyone has a seat

      assignmentsForCourse.push({
        courseId: course.id,
        roomId: room.id,
        timeslotId: randomTimeslot.id,
      });

      unassignedStudents -= room.capacity;
    }

    // Assign the completed schedule block to the course
    courseAssignments[course.id] = assignmentsForCourse;
  }

  return { courseAssignments };
}
