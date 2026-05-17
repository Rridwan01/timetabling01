import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { runGeneticAlgorithm } from "./geneticAlgorithm";
import { runSimulatedAnnealing } from "./simulatedAnnealing";

export function runHybridAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  // PHASE 1: Global Search (Genetic Algorithm)
  // Give GA 60% of the total generations to find a solid foundational timetable
  const gaGenerations = Math.floor((config.algorithm_tuning?.generations || 2000) * 0.6);
  const gaConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: gaGenerations
    }
  };

  console.log(`Starting Phase 1: GA with ${gaGenerations} generations...`);
  const gaBestSolution = runGeneticAlgorithm(gaConfig, courses, rooms, timeslots);

  // PHASE 2: Local Refinement (Simulated Annealing)
  // Give SA the remaining 40% of generations, feeding it the GA's best result
  const saGenerations = Math.floor((config.algorithm_tuning?.generations || 2000) * 0.4);
  const saConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: saGenerations
    }
  };

  console.log(`Starting Phase 2: SA with ${saGenerations} generations for refinement...`);
  const finalHybridSolution = runSimulatedAnnealing(saConfig, courses, rooms, timeslots, gaBestSolution);

  return finalHybridSolution;
}