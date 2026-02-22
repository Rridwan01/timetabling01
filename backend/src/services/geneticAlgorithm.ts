import { Timetable } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

interface Course {
  id: number;
  numStudents: number;
}

interface Room {
  id: number;
  capacity: number;
}

interface Timeslot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface GeneticAlgorithmConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
}

/**
 * Runs the Genetic Algorithm to generate an optimal timetable.
 * @param config Configuration for the Genetic Algorithm.
 * @param courses List of courses.
 * @param rooms List of rooms.
 * @param timeslots List of timeslots.
 * @returns The best timetable found.
 */
export function runGeneticAlgorithm(
  config: GeneticAlgorithmConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  // Generate initial population
  let population: Timetable[] = [];
  for (let i = 0; i < config.populationSize; i++) {
    population.push(generateRandomTimetable(courses, rooms, timeslots));
  }

  let bestTimetable = population[0];
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms);

  // Run generations
  for (let generation = 0; generation < config.generations; generation++) {
    // Evaluate fitness for each timetable
    const fitnessScores = population.map((timetable) =>
      evaluateFitness(timetable, courses, rooms)
    );

    // Find the best timetable in the current generation
    for (let i = 0; i < fitnessScores.length; i++) {
      if (fitnessScores[i] > bestFitness) {
        bestFitness = fitnessScores[i];
        bestTimetable = population[i];
      }
    }

    // Select parents (tournament selection)
    const parents: Timetable[] = [];
    for (let i = 0; i < config.populationSize; i++) {
      const parent1 = population[Math.floor(Math.random() * population.length)];
      const parent2 = population[Math.floor(Math.random() * population.length)];
      parents.push(
        evaluateFitness(parent1, courses, rooms) >
        evaluateFitness(parent2, courses, rooms)
          ? parent1
          : parent2
      );
    }

    // Crossover
    const newPopulation: Timetable[] = [];
    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1] || parents[0];

      const crossoverPoint = Math.floor(
        Math.random() * parent1.assignments.length
      );

      const child1Assignments = [
        ...parent1.assignments.slice(0, crossoverPoint),
        ...parent2.assignments.slice(crossoverPoint),
      ];

      const child2Assignments = [
        ...parent2.assignments.slice(0, crossoverPoint),
        ...parent1.assignments.slice(crossoverPoint),
      ];

      newPopulation.push({ assignments: child1Assignments });
      newPopulation.push({ assignments: child2Assignments });
    }

    // Mutation
    for (const timetable of newPopulation) {
      if (Math.random() < config.mutationRate) {
        const randomIndex = Math.floor(
          Math.random() * timetable.assignments.length
        );
        const randomTimeslot =
          timeslots[Math.floor(Math.random() * timeslots.length)];
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

        timetable.assignments[randomIndex] = {
          ...timetable.assignments[randomIndex],
          timeslotId: randomTimeslot.id,
          roomId: randomRoom.id,
        };
      }
    }

    // Update population
    population = newPopulation;
  }

  return bestTimetable;
}