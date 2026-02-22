// TypeScript interfaces for the timetable data model

export interface Timeslot {
  id: number;
  date: string; // ISO date string (e.g., '2026-06-01')
  startTime: string; // ISO time string (e.g., '09:00:00')
  endTime: string; // ISO time string (e.g., '12:00:00')
}

export interface ExamAssignment {
  courseId: number;
  roomId: number;
  timeslotId: number;
}

export interface Timetable {
  assignments: ExamAssignment[];
}