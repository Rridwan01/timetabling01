import { Request, Response } from "express";
import { runGeneticAlgorithm } from "../services/geneticAlgorithm";
import { runSimulatedAnnealing } from "../services/simulatedAnnealing";
import { runHybridAlgorithm } from "../services/hybridAlgorithm";
import { evaluateFitness } from "../services/fitness";
import { query } from "../db/index";
import { Timetable, TimetableConfig } from "../models/timetable";

export const generateTimetable = async (req: Request, res: Response) => {
  const { hard_constraints, soft_constraints, algorithm_tuning } = req.body;

  if (!hard_constraints || !soft_constraints || !algorithm_tuning) {
    return res.status(400).json({ error: "Missing timetable configuration parameters." });
  }

  const config: TimetableConfig = { hard_constraints, soft_constraints, algorithm_tuning };
  const algorithm = algorithm_tuning.engine;

  try {
    const coursesResult = await query(`SELECT id, code, title, level, num_students AS "numStudents", lecturer FROM courses`);
    const roomsResult = await query(`SELECT id, name, capacity, availability FROM rooms`);
    const timeslotsResult = await query(`SELECT id, label, date, start_time AS "startTime", end_time AS "endTime" FROM timeslots`);

    const courses = coursesResult.rows;
    const rooms = roomsResult.rows;
    const timeslots = timeslotsResult.rows;

    if (courses.length === 0 || rooms.length === 0 || timeslots.length === 0) {
      return res.status(400).json({ error: "Insufficient data in the database." });
    }

    let bestTimetable: Timetable;
    const startTime = Date.now();

    // 1. The Router
    if (algorithm === "Simulated Annealing") {
      bestTimetable = runSimulatedAnnealing(config, courses, rooms, timeslots);
    } else if (algorithm === "Hybrid GA-SA") {
      bestTimetable = runHybridAlgorithm(config, courses, rooms, timeslots);
    } else {
      bestTimetable = runGeneticAlgorithm(config, courses, rooms, timeslots);
    }

    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    const fitnessPercentage = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

    // 2. Hydration (Formatting the names and raw dates)
    const courseStudentTracker = new Map<number, number>();

    const hydratedTimetable = bestTimetable.assignments.map((assignment) => {
      const course = courses.find((c) => c.id === assignment.courseId);
      const room = rooms.find((r) => r.id === assignment.roomId);
      const timeslot = timeslots.find((t) => t.id === assignment.timeslotId);

      if (!courseStudentTracker.has(assignment.courseId)) {
        courseStudentTracker.set(assignment.courseId, course.numStudents);
      }

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
        assignedStudents: allocatedStudents, // Actual student count in this room
        roomName: room.name,
        date: timeslot.date, // Raw date to prevent frontend sorting crashes!
        timeslotLabel: timeslot.label,
        timeString: `${new Date(timeslot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(timeslot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      };
    });

    // 3. Database Logging
    const adminId = 1; 
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

    for (const assignment of bestTimetable.assignments) {
      await query(
        `INSERT INTO assignments (run_id, course_id, timeslot_id, room_id) VALUES ($1, $2, $3, $4)`,
        [runId, assignment.courseId, assignment.timeslotId, assignment.roomId],
      );
    }

    // 4. Standardized Return Payload
    res.json({
      timetable: { assignments: hydratedTimetable }, // Perfectly matches React's expectations
      timeslots: timeslots,         
      fitness: fitnessPercentage,
      timeTakenMs: executionTimeMs,
      iterationsRun: algorithm_tuning.generations,
      message: `${algorithm} completed successfully.`,
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const resetSystem = async (req: Request, res: Response) => {
  try {
    await query("TRUNCATE TABLE assignments, timetable_runs, run_configs, courses, rooms RESTART IDENTITY CASCADE");
    res.json({ message: "System completely reset." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset." });
  }
};