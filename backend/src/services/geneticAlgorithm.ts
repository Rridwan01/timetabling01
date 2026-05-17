import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

export function runGeneticAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  const popSize = 100; 
  const generations = config.algorithm_tuning?.generations || 1000;
  
  let mutationRate = 0.05; 
  if (config.algorithm_tuning?.mutationRate === "Low") mutationRate = 0.01;
  if (config.algorithm_tuning?.mutationRate === "High") mutationRate = 0.15;

  const availableRooms = rooms.filter(r => r.availability === 'Available');

  // 🔴 ISSUE 4 FIX: Throw a clear error so the controller handles it gracefully
  if (availableRooms.length === 0 || courses.length === 0 || timeslots.length === 0) {
      throw new Error("Insufficient database records (courses, rooms, or timeslots) to generate timetable.");
  }

  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(generateRandomTimetable(courses, availableRooms, timeslots));
  }

  let bestTimetable = population[0];
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

  for (let generation = 0; generation < generations; generation++) {
    
    // Score and Sort
    const scoredPopulation = population
      .filter(t => t && t.assignments && t.assignments.length > 0) 
      .map((timetable) => ({
        timetable,
        fitness: evaluateFitness(timetable, courses, rooms, timeslots, config)
      }))
      .sort((a, b) => b.fitness - a.fitness);

    // 🔴 ISSUE 1 FIX: Population Revival System
    // If filtering destroys the population, generate a fresh random batch instead of giving up!
    if (scoredPopulation.length === 0) {
      console.warn(`Population collapsed at generation ${generation}. Regenerating...`);
      population = [];
      for (let i = 0; i < popSize; i++) {
        population.push(generateRandomTimetable(courses, availableRooms, timeslots));
      }
      continue; 
    }

    // Track global best
    if (scoredPopulation[0].fitness > bestFitness) {
      bestFitness = scoredPopulation[0].fitness;
      bestTimetable = JSON.parse(JSON.stringify(scoredPopulation[0].timetable));
    }

    const newPopulation: Timetable[] = [];
    
    // ELITISM: Pass the top schedules safely
    const elitismCount = Math.min(2, scoredPopulation.length);
    for (let i = 0; i < elitismCount; i++) {
      newPopulation.push(JSON.parse(JSON.stringify(scoredPopulation[i].timetable)));
    }

    // Breed the rest of the population
    while (newPopulation.length < popSize) {
      
      // 🟡 ISSUE 3 FIX: Read cached fitness scores instead of recalculating!
      const getParent = () => {
          const p1 = scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
          const p2 = scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
          return p1.fitness > p2.fitness ? p1.timetable : p2.timetable;
      };

      const parent1 = getParent();
      const parent2 = getParent();

      // Safe Crossover
      const len1 = parent1.assignments.length;
      const len2 = parent2.assignments.length;
      const crossoverPoint = Math.floor(Math.random() * Math.min(len1, len2));

      const child: Timetable = {
        assignments: [
          ...parent1.assignments.slice(0, crossoverPoint),
          ...parent2.assignments.slice(crossoverPoint),
        ]
      };
      
      // 🔴 ISSUE 2 FIX: True Course Splitting Mutation
      if (Math.random() < mutationRate && child.assignments.length > 0) {
        const randomIndex = Math.floor(Math.random() * child.assignments.length);
        const randomCourseId = child.assignments[randomIndex].courseId;
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        
        for (let j = 0; j < child.assignments.length; j++) {
            // Find ALL segments of the split course and move them to the new timeslot
            if (child.assignments[j].courseId === randomCourseId) {
                // Give every single segment its own fresh, random room
                const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
                
                child.assignments[j] = {
                    ...child.assignments[j],
                    timeslotId: randomTimeslot.id,
                    roomId: randomRoom.id
                };
            }
        }
      }
      
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return bestTimetable;
}