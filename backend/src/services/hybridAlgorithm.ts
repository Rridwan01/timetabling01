// backend/src/services/hybridAlgorithm.ts
import { Timetable, Course, Room, Timeslot, TimetableConfig, ExamAssignment } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";
import { runSimulatedAnnealing, cloneTimetable } from "./simulatedAnnealing";

export function runHybridAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  console.log("Starting Memetic Hybrid Algorithm (GA + SA Local Search)...");

  const popSize = 100; 
  const generations = config.algorithm_tuning?.generations || 1000;
  let mutationRate = 0.05; 
  if (config.algorithm_tuning?.mutationRate === "Low") mutationRate = 0.01;
  if (config.algorithm_tuning?.mutationRate === "High") mutationRate = 0.15;

  const availableRooms = rooms.filter(r => r.availability === 'Available');

  if (availableRooms.length === 0 || courses.length === 0 || timeslots.length === 0) {
      throw new Error("Insufficient data for Hybrid Phase.");
  }

  // 1. Initialization
  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(generateRandomTimetable(courses, availableRooms, timeslots));
  }

  let bestTimetable = cloneTimetable(population[0]);
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

  // 2. Evolution Loop
  for (let generation = 0; generation < generations; generation++) {
    
    // Score & Sort
    const scoredPopulation = population
      .map((timetable) => ({
        timetable,
        fitness: evaluateFitness(timetable, courses, rooms, timeslots, config)
      }))
      .sort((a, b) => b.fitness - a.fitness);

    // ============================================================================
    // THE MEMETIC INTERJECTION
    // Every 50 generations, use SA as a Local Search to aggressively polish 
    // the top 2 elite chromosomes before passing them to the next generation.
    // ============================================================================
    if (generation > 0 && generation % 50 === 0) {
      console.log(`Generation ${generation}: Triggering SA Local Search on Elites...`);
      const elitismCount = Math.min(2, scoredPopulation.length);
      
      for (let i = 0; i < elitismCount; i++) {
        // Run a short, intense SA burst (500 iterations)
        const polishedElite = runSimulatedAnnealing(config, courses, rooms, timeslots, scoredPopulation[i].timetable, 500);
        scoredPopulation[i].timetable = polishedElite;
        scoredPopulation[i].fitness = evaluateFitness(polishedElite, courses, rooms, timeslots, config);
      }
      // Re-sort in case the polished elites drastically improved
      scoredPopulation.sort((a, b) => b.fitness - a.fitness);
    }

    // Track Global Best
    if (scoredPopulation[0].fitness > bestFitness) {
      bestFitness = scoredPopulation[0].fitness;
      bestTimetable = cloneTimetable(scoredPopulation[0].timetable);
    }

    const newPopulation: Timetable[] = [];
    
    // Elitism
    const elitismCount = Math.min(2, scoredPopulation.length);
    for (let i = 0; i < elitismCount; i++) {
      newPopulation.push(cloneTimetable(scoredPopulation[i].timetable));
    }

    // Breed remainder
    while (newPopulation.length < popSize) {
      const getParent = () => {
          const p1 = scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
          const p2 = scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
          return p1.fitness > p2.fitness ? p1.timetable : p2.timetable;
      };

      const parent1 = getParent();
      const parent2 = getParent();

      // Whole-Course Uniform Crossover
      const childAssignments: Record<number, ExamAssignment[]> = {};
      for (const course of courses) {
        const inheritFromP1 = Math.random() > 0.5;
        const sourceAssignments = inheritFromP1 ? parent1.courseAssignments[course.id] : parent2.courseAssignments[course.id];
        childAssignments[course.id] = sourceAssignments.map(a => ({ ...a }));
      }
      
      const child: Timetable = { courseAssignments: childAssignments };
      
      // Course-Level Mutation
      if (Math.random() < mutationRate) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        const targetAssignments = child.courseAssignments[randomCourse.id];
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        for (const assignment of targetAssignments) {
            assignment.timeslotId = randomTimeslot.id;
        }
      }
      
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return bestTimetable;
}