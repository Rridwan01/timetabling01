import { Request, Response } from "express";
import { runGeneticAlgorithm } from "../services/geneticAlgorithm";
import { evaluateFitness } from "../services/fitness";
import { query } from "../db/index";
import { Timetable } from "../models/timetable";
import { runSimulatedAnnealing } from "../services/simulatedAnnealing";

/**
 * POST /api/timetable/generate
 * Generates a timetable using the Genetic Algorithm.
 */
export const generateTimetable = async (req: Request, res: Response) => {
  const { populationSize, generations, mutationRate, algorithm } = req.body;

  // Validate input
  if (!populationSize || !generations || !mutationRate || !algorithm) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // Fetch data from the database
    const coursesResult = await query(
      "SELECT id, num_students AS \"numStudents\", dept_id FROM courses"
    );
    const roomsResult = await query("SELECT id, capacity FROM rooms");
    const timeslotsResult = await query(
      "SELECT id, date, start_time AS \"startTime\", end_time AS \"endTime\" FROM timeslots"
    );

    const courses = coursesResult.rows;
    const rooms = roomsResult.rows;
    const timeslots = timeslotsResult.rows;

    let bestTimetable: Timetable;
    const startTime = Date.now();

    if (algorithm === "GA") {
      bestTimetable = runGeneticAlgorithm(
        { populationSize, generations, mutationRate },
        courses,
        rooms,
        timeslots
      );
    } else if (algorithm === "SA") {
      bestTimetable = runSimulatedAnnealing(
        { initialTemperature: 1000, coolingRate: 0.95, iterations: generations },
        courses,
        rooms,
        timeslots
      );
    } else {
      return res.status(400).json({ error: "Invalid algorithm specified." });
    }

    const endTime = Date.now();
    const fitness = evaluateFitness(bestTimetable, courses, rooms, timeslots);

    // Return the best timetable, fitness score, and time taken
    res.json({
      timetable: bestTimetable,
      fitness,
      timeTaken: endTime - startTime,
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};