import { Timetable, ExamAssignment, Timeslot } from "../models/timetable";

interface Course {
  id: number;
  numStudents: number;
}

interface Room {
  id: number;
  capacity: number;
}

/**
 * Generates a random valid timetable.
 * @param courses List of courses.
 * @param rooms List of rooms.
 * @param timeslots List of timeslots.
 * @returns A randomly generated timetable.
 */
export function generateRandomTimetable(
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  const assignments: ExamAssignment[] = [];

  for (const course of courses) {
    // Randomly select a timeslot
    const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];

    // Randomly select a room
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

    // Create an exam assignment
    const assignment: ExamAssignment = {
      courseId: course.id,
      roomId: randomRoom.id,
      timeslotId: randomTimeslot.id,
    };

    assignments.push(assignment);
  }

  return { assignments };
}