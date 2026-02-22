import { Request, Response } from "express";
import { runGeneticAlgorithm } from "../services/geneticAlgorithm";
import { evaluateFitness } from "../services/fitness";
import { query } from "../db";
import { Timetable } from "../models/timetable";

/**
 * POST /api/timetable/generate
 * Generates a timetable using the Genetic Algorithm.
 */
export const generateTimetable = async (req: Request, res: Response) => {
  const { populationSize, generations, mutationRate } = req.body;

  // Validate input
  if (!populationSize || !generations || !mutationRate) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // Fetch data from the database
    const coursesResult = await query(
      "SELECT id, num_students AS \"numStudents\" FROM courses"
    );
    const roomsResult = await query("SELECT id, capacity FROM rooms");
    const timeslotsResult = await query(
      "SELECT id, date, start_time AS \"startTime\", end_time AS \"endTime\" FROM timeslots"
    );

    const courses = coursesResult.rows;
    const rooms = roomsResult.rows;
    const timeslots = timeslotsResult.rows;

    // Run Genetic Algorithm
    const bestTimetable: Timetable = runGeneticAlgorithm(
      { populationSize, generations, mutationRate },
      courses,
      rooms,
      timeslots
    );

    // Evaluate fitness of the best timetable
    const fitness = evaluateFitness(bestTimetable, courses, rooms);

    // Return the best timetable and its fitness score
    res.json({
      timetable: bestTimetable,
      fitness,
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};