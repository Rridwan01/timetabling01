import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

export function runGeneticAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  // Lock population size to a sane number so it doesn't overload the CPU
  const popSize = 100; 
  const generations = config.algorithm_tuning?.generations || 1000;
  
  let mutationRate = 0.05; 
  if (config.algorithm_tuning?.mutationRate === "Low") mutationRate = 0.01;
  if (config.algorithm_tuning?.mutationRate === "High") mutationRate = 0.15;

  const availableRooms = rooms.filter(r => r.availability === 'Available');

  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(generateRandomTimetable(courses, availableRooms, timeslots));
  }

  let bestTimetable = population[0];
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

  for (let generation = 0; generation < generations; generation++) {
    // 1. Score and Sort the entire population (Best to Worst)
    const scoredPopulation = population.map((timetable) => ({
      timetable,
      fitness: evaluateFitness(timetable, courses, rooms, timeslots, config)
    })).sort((a, b) => b.fitness - a.fitness);

    // Track global best
    if (scoredPopulation[0].fitness > bestFitness) {
      bestFitness = scoredPopulation[0].fitness;
      bestTimetable = scoredPopulation[0].timetable;
    }

    const newPopulation: Timetable[] = [];
    
    // 2. ELITISM: Pass the top 2 timetables directly to the next generation
    const elitismCount = 2;
    for (let i = 0; i < elitismCount; i++) {
      // Deep copy to prevent mutation reference bugs
      newPopulation.push(JSON.parse(JSON.stringify(scoredPopulation[i].timetable)));
    }

    // 3. Tournament Selection for the rest
    const parents: Timetable[] = [];
    for (let i = 0; i < popSize - elitismCount; i++) {
      const parent1 = population[Math.floor(Math.random() * popSize)];
      const parent2 = population[Math.floor(Math.random() * popSize)];
      parents.push(
        evaluateFitness(parent1, courses, rooms, timeslots, config) >
        evaluateFitness(parent2, courses, rooms, timeslots, config)
          ? parent1
          : parent2
      );
    }

    // 4. Crossover & Mutation for the new children
    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1] || parents[0];
      const crossoverPoint = Math.floor(Math.random() * parent1.assignments.length);

      const child1 = {
        assignments: [
          ...parent1.assignments.slice(0, crossoverPoint),
          ...parent2.assignments.slice(crossoverPoint),
        ]
      };
      
      // Apply Mutation to Child
      if (Math.random() < mutationRate) {
        const randomIndex = Math.floor(Math.random() * child1.assignments.length);
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        child1.assignments[randomIndex] = {
          ...child1.assignments[randomIndex],
          timeslotId: randomTimeslot.id,
          roomId: randomRoom.id,
        };
      }
      newPopulation.push(child1);
      
      // Stop if we hit population limit
      if (newPopulation.length >= popSize) break;
    }

    population = newPopulation;
  }

  return bestTimetable;
}