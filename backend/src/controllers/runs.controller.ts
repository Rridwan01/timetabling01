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
  // Destructure the exact JSON payload sent from our React ConstraintsScreen
  const { hard_constraints, soft_constraints, algorithm_tuning } = req.body;

  // Validate input to ensure the frontend sent the complete config
  if (!hard_constraints || !soft_constraints || !algorithm_tuning) {
    return res.status(400).json({ error: "Missing timetable configuration parameters." });
  }

  const config: TimetableConfig = {
    hard_constraints,
    soft_constraints,
    algorithm_tuning
  };

  const algorithm = algorithm_tuning.engine;

  try {
    // 1. Fetch updated data from the database mapped to our new interfaces
    const coursesResult = await query(
      `SELECT id, code, title, level, num_students AS "numStudents", lecturer FROM courses`
    );
    
    const roomsResult = await query(
      `SELECT id, name, capacity, availability FROM rooms`
    );
    
    const timeslotsResult = await query(
      `SELECT id, label, date, start_time AS "startTime", end_time AS "endTime" FROM timeslots`
    );

    const courses = coursesResult.rows;
    const rooms = roomsResult.rows;
    const timeslots = timeslotsResult.rows;

    // Safety check: Ensure we have data to process
    if (courses.length === 0 || rooms.length === 0 || timeslots.length === 0) {
       return res.status(400).json({ error: "Insufficient data in the database to generate a timetable." });
    }

    let bestTimetable: Timetable;
    const startTime = Date.now();

    // 2. Route to the correct optimization engine
    if (algorithm === "Genetic Algorithm") {
      bestTimetable = runGeneticAlgorithm(config, courses, rooms, timeslots);
    } else if (algorithm === "Simulated Annealing") {
      bestTimetable = runSimulatedAnnealing(config, courses, rooms, timeslots);
    } else {
      return res.status(400).json({ error: "Invalid algorithm specified." });
    }

    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;

    // 3. Evaluate the final fitness score using our dynamic UI rules
    const fitnessPercentage = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

    // Optional: You can insert this run into your `timetable_runs` and `run_configs` tables right here!

    // 4. Return the payload to the frontend Execution Dashboard
    res.json({
      timetable: bestTimetable,
      fitness: fitnessPercentage,
      timeTakenMs: executionTimeMs,
      iterationsRun: algorithm_tuning.generations,
      message: `${algorithm} completed successfully.`
    });

  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: "Internal server error during timetable generation." });
  }
};

/**
 * DELETE /api/timetable/reset
 * Danger Zone: Wipes courses, rooms, and timetable history for a fresh start.
 */
export const resetSystem = async (req: Request, res: Response) => {
  try {
    // TRUNCATE empties the tables. CASCADE automatically deletes any linked assignments!
    await query('TRUNCATE TABLE assignments, timetable_runs, run_configs, courses, rooms RESTART IDENTITY CASCADE');
    
    res.json({ message: "System completely reset. All courses and rooms wiped." });
  } catch (error) {
    console.error("Error resetting system:", error);
    res.status(500).json({ error: "Failed to reset the system." });
  }
};