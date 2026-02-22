import { Request, Response } from "express";
import { runGeneticAlgorithm } from "../services/geneticAlgorithm";
import { evaluateFitness } from "../services/fitness";
import { generateRandomTimetable } from "../services/population";
import { Timeslot, Timetable } from "../models/timetable";

// Mock data for timeslots
const mockTimeslots: Timeslot[] = [
  { id: 1, date: "2026-06-01", startTime: "09:00:00", endTime: "12:00:00" },
  { id: 2, date: "2026-06-01", startTime: "13:00:00", endTime: "16:00:00" },
  { id: 3, date: "2026-06-02", startTime: "09:00:00", endTime: "12:00:00" },
  { id: 4, date: "2026-06-02", startTime: "13:00:00", endTime: "16:00:00" },
];

// Mock data for courses and rooms
const mockCourses = [
  { id: 1, numStudents: 30 },
  { id: 2, numStudents: 50 },
  { id: 3, numStudents: 20 },
];

const mockRooms = [
  { id: 1, capacity: 40 },
  { id: 2, capacity: 50 },
  { id: 3, capacity: 30 },
];

/**
 * POST /api/timetable/generate
 * Generates a timetable using the Genetic Algorithm.
 */
export const generateTimetable = (req: Request, res: Response) => {
  const { populationSize, generations, mutationRate } = req.body;

  // Validate input
  if (!populationSize || !generations || !mutationRate) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  // Run Genetic Algorithm
  const bestTimetable: Timetable = runGeneticAlgorithm(
    { populationSize, generations, mutationRate },
    mockCourses,
    mockRooms,
    mockTimeslots
  );

  // Evaluate fitness of the best timetable
  const fitness = evaluateFitness(bestTimetable, mockCourses, mockRooms);

  // Return the best timetable and its fitness score
  res.json({
    timetable: bestTimetable,
    fitness,
  });
};