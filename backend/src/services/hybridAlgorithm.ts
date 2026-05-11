import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { runGeneticAlgorithm } from "./geneticAlgorithm";
import { runSimulatedAnnealing } from "./simulatedAnnealing";

export function runHybridAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  // 1. Phase One: Global Search (Genetic Algorithm)
  // We reduce the GA generations slightly so the hybrid approach doesn't take twice as long to run.
  const gaConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: Math.floor((config.algorithm_tuning?.generations || 1000) * 0.6) // Run GA for 60% of the time
    }
  };

  const gaBestSolution = runGeneticAlgorithm(gaConfig, courses, rooms, timeslots);

  // 2. Phase Two: Local Refinement (Simulated Annealing)
  // We feed the GA's best solution directly into SA to polish off any remaining hard constraint clashes.
  const saConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: Math.floor((config.algorithm_tuning?.generations || 5000) * 0.4) // Run SA for the remaining 40%
    }
  };

  const finalHybridSolution = runSimulatedAnnealing(saConfig, courses, rooms, timeslots, gaBestSolution);

  return finalHybridSolution;
}