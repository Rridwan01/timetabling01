import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { runGeneticAlgorithm } from "./geneticAlgorithm";
import { runSimulatedAnnealing } from "./simulatedAnnealing";

export function runHybridAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  const totalGenerations = config.algorithm_tuning?.generations || 1000;
  
  // ISSUE 3 FIX: Adaptive Engine Split
  // Massive datasets require more Global Search (GA) to find valid regions
  const gaRatio = courses.length > 30 ? 0.7 : 0.5;
  
  const gaConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: Math.floor(totalGenerations * gaRatio)
    }
  };

  const gaBestSolution = runGeneticAlgorithm(gaConfig, courses, rooms, timeslots);

  // ISSUE 4 FIX: State Validation (Prevent SA Cascade Failure)
  if (!gaBestSolution || !gaBestSolution.assignments || gaBestSolution.assignments.length === 0) {
      throw new Error("Hybrid Phase 1 (GA) collapsed and failed to produce a valid state. Aborting SA.");
  }

  const saConfig: TimetableConfig = {
    ...config,
    algorithm_tuning: {
      ...config.algorithm_tuning,
      generations: Math.floor(totalGenerations * (1 - gaRatio))
    }
  };

  return runSimulatedAnnealing(saConfig, courses, rooms, timeslots, gaBestSolution);
}