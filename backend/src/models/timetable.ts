export interface ExamAssignment {
  courseId: number;
  roomId: number;
  timeslotId: number;
}

export interface Timetable {
  // Keyed by courseId to prevent crossover from splitting course schedules
  courseAssignments: Record<number, ExamAssignment[]>;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  level: string;
  numStudents: number;
  lecturer: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  availability: "Available" | "Maintenance";
}

export interface Timeslot {
  id: number;
  label: string;
  date: string;
  startTime: Date;
  endTime: Date;
}

export interface TimetableConfig {
  hard_constraints: any;
  soft_constraints: any;
  algorithm_tuning?: {
    generations?: number;
    mutationRate?: "Low" | "Medium" | "High";
  };
}

// Helper to bridge the new structure with the old flat-array fitness function (until Phase 3)
export function flattenAssignments(timetable: Timetable): ExamAssignment[] {
  if (!timetable.courseAssignments) return [];
  const flat: ExamAssignment[] = [];
  for (const courseId in timetable.courseAssignments) {
    flat.push(...timetable.courseAssignments[courseId]);
  }
  return flat;
}

export type ConflictMatrix = Record<number, Record<number, number>>;
// Key: courseId -> Key: courseId -> Value: Number of shared students
