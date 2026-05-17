import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { runGeneticAlgorithm } from "./geneticAlgorithm";
import { runSimulatedAnnealing } from "./simulatedAnnealing";

export function runHybridAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  console.log("Starting Hybrid Phase 1: Global Search (Genetic Algorithm)...");
  
  // 1. Let GA do its full job to find the best global structure
  const gaBestSolution = runGeneticAlgorithm(config, courses, rooms, timeslots);

  if (!gaBestSolution || !gaBestSolution.assignments || gaBestSolution.assignments.length === 0) {
      throw new Error("Hybrid Phase 1 (GA) collapsed and failed to produce a valid state.");
  }

  console.log("Starting Hybrid Phase 2: Local Refinement (Simulated Annealing)...");

  // 2. We pass the GA's best solution directly into SA. 
  // SA will use its micro-mutations to polish off any remaining hard clashes.
  // We lower the SA iterations slightly for Hybrid so it doesn't take too long.
  const saConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: Math.floor((config.algorithm_tuning?.generations || 1000) * 0.5) 
    }
  };

  return runSimulatedAnnealing(saConfig, courses, rooms, timeslots, gaBestSolution);
}