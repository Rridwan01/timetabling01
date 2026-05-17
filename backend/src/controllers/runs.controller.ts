import { Request, Response } from "express";
import { runGeneticAlgorithm } from "../services/geneticAlgorithm";
import { runSimulatedAnnealing } from "../services/simulatedAnnealing";
import { evaluateFitness } from "../services/fitness";
import { query } from "../db/index";
import { Timetable, TimetableConfig } from "../models/timetable";

/**
 * POST /api/timetable/generate
 * Generates an optimized examination timetable using the selected engine.
 */
export const generateTimetable = async (req: Request, res: Response) => {
  const { hard_constraints, soft_constraints, algorithm_tuning } = req.body;

  if (!hard_constraints || !soft_constraints || !algorithm_tuning) {
    return res
      .status(400)
      .json({ error: "Missing timetable configuration parameters." });
  }

  const config: TimetableConfig = {
    hard_constraints,
    soft_constraints,
    algorithm_tuning,
  };
  const algorithm = algorithm_tuning.engine;

  try {
    // 1. Fetch data
    const coursesResult = await query(
      `SELECT id, code, title, level, num_students AS "numStudents", lecturer FROM courses`,
    );
    const roomsResult = await query(
      `SELECT id, name, capacity, availability FROM rooms`,
    );
    const timeslotsResult = await query(
      `SELECT id, label, date, start_time AS "startTime", end_time AS "endTime" FROM timeslots`,
    );

    const courses = coursesResult.rows;
    const rooms = roomsResult.rows;
    const timeslots = timeslotsResult.rows;

    if (courses.length === 0 || rooms.length === 0 || timeslots.length === 0) {
      return res
        .status(400)
        .json({
          error: "Insufficient data in the database to generate a timetable.",
        });
    }

    let bestTimetable: Timetable;
    const startTime = Date.now();

    // 2. Run Algorithm
    if (algorithm === "Genetic Algorithm") {
      bestTimetable = runGeneticAlgorithm(config, courses, rooms, timeslots);
    } else if (algorithm === "Simulated Annealing") {
      bestTimetable = runSimulatedAnnealing(config, courses, rooms, timeslots);
    } else {
      return res.status(400).json({ error: "Invalid algorithm specified." });
    }

    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    const fitnessPercentage = evaluateFitness(
      bestTimetable,
      courses,
      rooms,
      timeslots,
      config,
    );

    // ==========================================
    // 3. HYDRATION (The "Dumb Data" Fix)
    // ==========================================
    const hydratedTimetable = bestTimetable.assignments.map((assignment) => {
      const course = courses.find((c) => c.id === assignment.courseId);
      const room = rooms.find((r) => r.id === assignment.roomId);
      const timeslot = timeslots.find((t) => t.id === assignment.timeslotId);

      return {
        id: `${assignment.courseId}-${assignment.roomId}-${assignment.timeslotId}`, // Unique ID for React map()
        courseCode: course.code,
        courseTitle: course.title,
        level: course.level,
        lecturer: course.lecturer,
        numStudents: course.numStudents,
        roomName: room.name,
        date: new Date(timeslot.date).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        timeslotLabel: timeslot.label,
        // Formats the Postgres timestamp into "09:00 AM - 11:00 AM"
        timeString: `${new Date(timeslot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(timeslot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      };
    });

    // ==========================================
    // 4. SAVE TO DATABASE (The "Amnesia" Fix)
    // ==========================================
    const adminId = 1; // Defaulting to our seeded admin

    // Step A: Save the configuration settings
    const configRes = await query(
      `INSERT INTO run_configs (name, algorithm, parameters, created_by) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        `Run - ${new Date().toLocaleString()}`,
        algorithm,
        JSON.stringify(config),
        adminId,
      ],
    );
    const runConfigId = configRes.rows[0].id;

    // Step B: Create the Run Record
    const runRes = await query(
      `INSERT INTO timetable_runs (run_config_id, status, started_at, finished_at, summary) VALUES ($1, $2, to_timestamp($3 / 1000.0), to_timestamp($4 / 1000.0), $5) RETURNING id`,
      [
        runConfigId,
        "COMPLETED",
        startTime,
        endTime,
        JSON.stringify({ fitness: fitnessPercentage, executionTimeMs }),
      ],
    );
    const runId = runRes.rows[0].id;

    // Step C: Save all the individual assignments
    for (const assignment of bestTimetable.assignments) {
      await query(
        `INSERT INTO assignments (run_id, course_id, timeslot_id, room_id) VALUES ($1, $2, $3, $4)`,
        [runId, assignment.courseId, assignment.timeslotId, assignment.roomId],
      );
    }

    // Step D: Log the algorithm metrics
    await query(
      `INSERT INTO algorithm_metrics (run_id, iteration, best_fitness, avg_fitness) VALUES ($1, $2, $3, $4)`,
      [
        runId,
        algorithm_tuning.generations,
        fitnessPercentage,
        fitnessPercentage,
      ],
    );

    // 5. Return the HYDRATED payload to the frontend
    res.json({
      timetable: hydratedTimetable, // React now receives beautiful, readable strings!
      fitness: fitnessPercentage,
      timeTakenMs: executionTimeMs,
      iterationsRun: algorithm_tuning.generations,
      message: `${algorithm} completed successfully and saved to database.`,
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    res
      .status(500)
      .json({ error: "Internal server error during timetable generation." });
  }
};

/**
 * DELETE /api/timetable/reset
 * Danger Zone: Wipes courses, rooms, and timetable history for a fresh start.
 */
export const resetSystem = async (req: Request, res: Response) => {
  try {
    // TRUNCATE empties the tables. CASCADE automatically deletes any linked assignments!
    await query(
      "TRUNCATE TABLE assignments, timetable_runs, run_configs, courses, rooms RESTART IDENTITY CASCADE",
    );

    res.json({
      message: "System completely reset. All courses and rooms wiped.",
    });
  } catch (error) {
    console.error("Error resetting system:", error);
    res.status(500).json({ error: "Failed to reset the system." });
  }
};
