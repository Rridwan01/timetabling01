import {
  Timetable,
  Course,
  Room,
  Timeslot,
  ExamAssignment,
} from "../models/timetable";

/**
 * Generates a completely random initial timetable (Chromosome).
 */
export function generateRandomTimetable(
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
): Timetable {
  const assignments: ExamAssignment[] = [];
  const availableRooms = rooms.filter((r) => r.availability === "Available");

  for (const course of courses) {
    const randomTimeslot =
      timeslots[Math.floor(Math.random() * timeslots.length)];

    let unassignedStudents = course.numStudents;
    // Shuffle rooms to randomize selection
    let shuffledRooms = [...availableRooms].sort(() => 0.5 - Math.random());

    for (const room of shuffledRooms) {
      if (unassignedStudents <= 0) break; // Stop when everyone has a seat

      assignments.push({
        courseId: course.id,
        roomId: room.id,
        timeslotId: randomTimeslot.id,
      });

      // Deduct this room's capacity from the remaining students
      unassignedStudents -= room.capacity;
    }
  }

  return { assignments };
}
