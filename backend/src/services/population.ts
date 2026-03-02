import { Timetable, Course, Room, Timeslot, ExamAssignment } from "../models/timetable";

/**
 * Generates a completely random initial timetable (Chromosome).
 */
export function generateRandomTimetable(
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  const assignments: ExamAssignment[] = [];
  
  // Filter out rooms that are under maintenance right from the start
  const availableRooms = rooms.filter(r => r.availability === 'Available');

  for (const course of courses) {
    // Pick a random timeslot
    const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
    // Pick a random AVAILABLE room
    const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];

    assignments.push({
      courseId: course.id,
      roomId: randomRoom.id,
      timeslotId: randomTimeslot.id,
    });
  }

  return { assignments };
}