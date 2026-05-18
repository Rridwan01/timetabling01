import { Timetable, Course, Room, Timeslot, TimetableConfig, ExamAssignment, ConflictMatrix } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";
import { runSimulatedAnnealing, cloneTimetable } from "./simulatedAnnealing";

export function runHybridAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  conflictMatrix: ConflictMatrix // <--- 5th Argument Added
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

  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(generateRandomTimetable(courses, availableRooms, timeslots));
  }

  let bestTimetable = cloneTimetable(population[0]);
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms, timeslots, config, conflictMatrix);

  for (let generation = 0; generation < generations; generation++) {
    
    const scoredPopulation = population
      .map((timetable) => ({
        timetable,
        fitness: evaluateFitness(timetable, courses, rooms, timeslots, config, conflictMatrix)
      }))
      .sort((a, b) => b.fitness - a.fitness);

    if (generation > 0 && generation % 50 === 0) {
      console.log(`Generation ${generation}: Triggering SA Local Search on Elites...`);
      const elitismCount = Math.min(2, scoredPopulation.length);
      
      for (let i = 0; i < elitismCount; i++) {
        // Pass the conflict matrix as the 7th parameter here
        const polishedElite = runSimulatedAnnealing(config, courses, rooms, timeslots, scoredPopulation[i].timetable, 500, conflictMatrix);
        scoredPopulation[i].timetable = polishedElite;
        scoredPopulation[i].fitness = evaluateFitness(polishedElite, courses, rooms, timeslots, config, conflictMatrix);
      }
      scoredPopulation.sort((a, b) => b.fitness - a.fitness);
    }

    if (scoredPopulation[0].fitness > bestFitness) {
      bestFitness = scoredPopulation[0].fitness;
      bestTimetable = cloneTimetable(scoredPopulation[0].timetable);
    }

    const newPopulation: Timetable[] = [];
    
    const elitismCount = Math.min(2, scoredPopulation.length);
    for (let i = 0; i < elitismCount; i++) {
      newPopulation.push(cloneTimetable(scoredPopulation[i].timetable));
    }

    while (newPopulation.length < popSize) {
      const getParent = () => {
          const p1 = scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
          const p2 = scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
          return p1.fitness > p2.fitness ? p1.timetable : p2.timetable;
      };

      const parent1 = getParent();
      const parent2 = getParent();

      const childAssignments: Record<number, ExamAssignment[]> = {};
      for (const course of courses) {
        const inheritFromP1 = Math.random() > 0.5;
        const sourceAssignments = inheritFromP1 ? parent1.courseAssignments[course.id] : parent2.courseAssignments[course.id];
        childAssignments[course.id] = sourceAssignments.map(a => ({ ...a }));
      }
      
      const child: Timetable = { courseAssignments: childAssignments };
      
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