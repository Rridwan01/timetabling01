// TypeScript interfaces for the timetable data model

export interface Timeslot {
  id: number;
  label: string; // e.g., 'Morning', 'Afternoon'
  date: string; // ISO date string (e.g., '2026-06-01')
  startTime: string; 
  endTime: string; 
}

export interface Course {
  id: number;
  code: string;
  title: string;
  level: string; // e.g., '400L'
  numStudents: number;
  lecturer: string; // Chief Examiner
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  availability: string; // 'Available' or 'Maintenance'
}

export interface ExamAssignment {
  courseId: number;
  roomId: number;
  timeslotId: number;
}

export interface Timetable {
  assignments: ExamAssignment[];
}

// Interfaces for the UI JSON Payload
export interface HardConstraints {
  studentClash: boolean;
  roomCapacity: boolean;
  chiefExaminerClash: boolean;
}

export interface SoftConstraints {
  examSpread: number;      // Penalty weight 1-10
  dailyLimit: number;      // Max exams per level per day
  roomUtilization: number; // Penalty weight 1-10
}

export interface TimetableConfig {
  hard_constraints: HardConstraints;
  soft_constraints: SoftConstraints;
  algorithm_tuning: any; // Used later for Generations/Mutation Rate
}