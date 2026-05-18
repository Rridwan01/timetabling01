import { Timetable, Course, Room, Timeslot, ExamAssignment } from "../models/timetable";

export function generateRandomTimetable(
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
): Timetable {
  const courseAssignments: Record<number, ExamAssignment[]> = {};
  const availableRooms = rooms.filter((r) => r.availability === "Available");

  for (const course of courses) {
    const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
    const assignmentsForCourse: ExamAssignment[] = [];
    
    // Fallback to prevent NaN mathematics
    let unassignedStudents = course.numStudents && course.numStudents > 0 ? course.numStudents : 30;

    const validRooms = availableRooms.filter(r => (r.capacity || 0) >= unassignedStudents);
    
    if (validRooms.length > 0) {
      validRooms.sort((a, b) => (a.capacity || 0) - (b.capacity || 0));
      assignmentsForCourse.push({
        courseId: course.id,
        roomId: validRooms[0].id,
        timeslotId: randomTimeslot.id,
      });
    } else {
      const sortedRooms = [...availableRooms].sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
      const semiRandomRooms = sortedRooms.sort(() => Math.random() - 0.2); 
      
      for (const room of semiRandomRooms) {
        if (unassignedStudents <= 0) break;
        assignmentsForCourse.push({
          courseId: course.id,
          roomId: room.id,
          timeslotId: randomTimeslot.id,
        });
        unassignedStudents -= (room.capacity || 30);
      }
    }
    
    courseAssignments[course.id] = assignmentsForCourse;
  }

  return { courseAssignments };
}