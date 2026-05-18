// backend/src/queues/timetable.queue.ts
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { runGeneticAlgorithm } from "../services/geneticAlgorithm";
import { runSimulatedAnnealing } from "../services/simulatedAnnealing";
import { runHybridAlgorithm } from "../services/hybridAlgorithm";
import { evaluateFitness } from "../services/fitness";
import { query } from "../db/index";
import { TimetableConfig, ExamAssignment } from "../models/timetable";

// 1. Setup Redis Connection (Connecting to your local WSL Redis)
const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
});

// 2. Export the Queue (The Controller uses this to add jobs)
export const timetableQueue = new Queue('TimetableOptimization', { connection });

// 3. Create the Background Worker
export const timetableWorker = new Worker('TimetableOptimization', async (job: Job) => {
  const { config, courses, rooms, timeslots, conflictMatrix, adminId, algorithm } = job.data;
  const startTime = Date.now();

  job.updateProgress(10); // Start progress

  // --- RUN ALGORITHM ---
  let bestTimetable;
  if (algorithm === "Simulated Annealing") {
    bestTimetable = runSimulatedAnnealing(config, courses, rooms, timeslots, undefined, undefined, conflictMatrix);
  } else if (algorithm === "Hybrid GA-SA") {
    bestTimetable = runHybridAlgorithm(config, courses, rooms, timeslots, conflictMatrix);
  } else {
    bestTimetable = runGeneticAlgorithm(config, courses, rooms, timeslots, conflictMatrix);
  }

  job.updateProgress(70); // Algorithm finished

  const endTime = Date.now();
  const executionTimeMs = endTime - startTime;
  const fitnessPercentage = evaluateFitness(bestTimetable, courses, rooms, timeslots, config, conflictMatrix);

  // --- FLATTEN THE DICTIONARY ---
  const flatAssignments: ExamAssignment[] = [];
  if (bestTimetable && bestTimetable.courseAssignments) {
      for (const courseId in bestTimetable.courseAssignments) {
          flatAssignments.push(...bestTimetable.courseAssignments[courseId]);
      }
  }

  job.updateProgress(80); 

  // --- HYDRATE DATA FOR UI ---
  const courseStudentTracker = new Map<number, number>();
  const hydratedTimetable = flatAssignments.map((assignment: ExamAssignment) => {
    const course = courses.find((c: any) => c.id === assignment.courseId)!;
    const room = rooms.find((r: any) => r.id === assignment.roomId)!;
    const timeslot = timeslots.find((t: any) => t.id === assignment.timeslotId)!;

    if (!courseStudentTracker.has(assignment.courseId)) courseStudentTracker.set(assignment.courseId, course.numStudents);
    const remainingStudents = courseStudentTracker.get(assignment.courseId)!;
    const allocatedStudents = Math.min(remainingStudents, room.capacity);
    courseStudentTracker.set(assignment.courseId, remainingStudents - allocatedStudents);

    return {
      id: `${assignment.courseId}-${assignment.roomId}-${assignment.timeslotId}`, 
      courseCode: course.code,
      courseTitle: course.title,
      level: course.level,
      lecturer: course.lecturer,
      numStudents: course.numStudents,
      assignedStudents: allocatedStudents, 
      roomName: room.name,
      date: timeslot.date, 
      timeslotLabel: timeslot.label,
      timeString: `${new Date(timeslot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(timeslot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
  });

  job.updateProgress(90); // Saving to DB

  // --- SAVE TO DATABASE ---
  const configRes = await query(
    `INSERT INTO run_configs (name, algorithm, parameters, created_by) VALUES ($1, $2, $3, $4) RETURNING id`,
    [`Run - ${new Date().toLocaleString()}`, algorithm, JSON.stringify(config), adminId],
  );
  const runConfigId = configRes.rows[0].id;

  const runRes = await query(
    `INSERT INTO timetable_runs (run_config_id, status, started_at, finished_at, summary) VALUES ($1, $2, to_timestamp($3 / 1000.0), to_timestamp($4 / 1000.0), $5) RETURNING id`,
    [runConfigId, "COMPLETED", startTime, endTime, JSON.stringify({ fitness: fitnessPercentage, executionTimeMs })],
  );
  const runId = runRes.rows[0].id;

  for (const assignment of flatAssignments) {
    await query(
      `INSERT INTO assignments (run_id, course_id, timeslot_id, room_id) VALUES ($1, $2, $3, $4)`,
      [runId, assignment.courseId, assignment.timeslotId, assignment.roomId],
    );
  }

  job.updateProgress(100); 

  // Return final payload to the controller
  return {
    timetable: { assignments: hydratedTimetable }, 
    timeslots: timeslots,         
    fitness: fitnessPercentage,
    timeTakenMs: executionTimeMs
  };
}, { connection });