import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

/**
 * Runs the Genetic Algorithm to generate an optimal timetable.
 */
export function runGeneticAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  // Extract algorithm parameters from the UI config payload
  const popSize = config.algorithm_tuning?.generations || 500; // Using generations input as population proxy if needed, or define separately
  const generations = config.algorithm_tuning?.generations || 1000;
  
  // Convert "Low", "Medium", "High" from UI into actual decimal mutation rates
  let mutationRate = 0.05; // Medium default
  if (config.algorithm_tuning?.mutationRate === "Low") mutationRate = 0.01;
  if (config.algorithm_tuning?.mutationRate === "High") mutationRate = 0.15;

  const availableRooms = rooms.filter(r => r.availability === 'Available');

  // Generate initial population
  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(generateRandomTimetable(courses, availableRooms, timeslots));
  }

  let bestTimetable = population[0];
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

  // Run generations
  for (let generation = 0; generation < generations; generation++) {
    const fitnessScores = population.map((timetable) =>
      evaluateFitness(timetable, courses, rooms, timeslots, config)
    );

    for (let i = 0; i < fitnessScores.length; i++) {
      if (fitnessScores[i] > bestFitness) {
        bestFitness = fitnessScores[i];
        bestTimetable = population[i];
      }
    }

    // Select parents (Tournament Selection)
    const parents: Timetable[] = [];
    for (let i = 0; i < popSize; i++) {
      const parent1 = population[Math.floor(Math.random() * population.length)];
      const parent2 = population[Math.floor(Math.random() * population.length)];
      parents.push(
        evaluateFitness(parent1, courses, rooms, timeslots, config) >
        evaluateFitness(parent2, courses, rooms, timeslots, config)
          ? parent1
          : parent2
      );
    }

    // Crossover
    const newPopulation: Timetable[] = [];
    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1] || parents[0];

      const crossoverPoint = Math.floor(Math.random() * parent1.assignments.length);

      newPopulation.push({
        assignments: [
          ...parent1.assignments.slice(0, crossoverPoint),
          ...parent2.assignments.slice(crossoverPoint),
        ]
      });
      newPopulation.push({
        assignments: [
          ...parent2.assignments.slice(0, crossoverPoint),
          ...parent1.assignments.slice(crossoverPoint),
        ]
      });
    }

    // Mutation
    for (const timetable of newPopulation) {
      if (Math.random() < mutationRate) {
        const randomIndex = Math.floor(Math.random() * timetable.assignments.length);
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];

        timetable.assignments[randomIndex] = {
          ...timetable.assignments[randomIndex],
          timeslotId: randomTimeslot.id,
          roomId: randomRoom.id,
        };
      }
    }

    population = newPopulation;
  }

  return bestTimetable;
}