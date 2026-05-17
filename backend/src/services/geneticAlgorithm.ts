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

  if (availableRooms.length === 0 || courses.length === 0 || timeslots.length === 0) {
      return { assignments: [] }; 
  }

  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(generateRandomTimetable(courses, availableRooms, timeslots));
  }

  let bestTimetable = population[0];
  let bestFitness = evaluateFitness(bestTimetable, courses, rooms, timeslots, config);

  for (let generation = 0; generation < generations; generation++) {
    
    // Safety Filter
    const scoredPopulation = population
      .filter(t => t && t.assignments && t.assignments.length > 0) 
      .map((timetable) => ({
        timetable,
        fitness: evaluateFitness(timetable, courses, rooms, timeslots, config)
      }))
      .sort((a, b) => b.fitness - a.fitness);

    if (scoredPopulation.length === 0) break;

    if (scoredPopulation[0].fitness > bestFitness) {
      bestFitness = scoredPopulation[0].fitness;
      bestTimetable = JSON.parse(JSON.stringify(scoredPopulation[0].timetable));
    }

    const newPopulation: Timetable[] = [];
    const elitismCount = Math.min(2, scoredPopulation.length);
    for (let i = 0; i < elitismCount; i++) {
      newPopulation.push(JSON.parse(JSON.stringify(scoredPopulation[i].timetable)));
    }

    const validPopulation = scoredPopulation.map(s => s.timetable);

    while (newPopulation.length < popSize) {
      const getParent = () => {
          const p1 = validPopulation[Math.floor(Math.random() * validPopulation.length)];
          const p2 = validPopulation[Math.floor(Math.random() * validPopulation.length)];
          return evaluateFitness(p1, courses, rooms, timeslots, config) > evaluateFitness(p2, courses, rooms, timeslots, config) ? p1 : p2;
      };

      const parent1 = getParent();
      const parent2 = getParent();

      const len1 = parent1.assignments.length;
      const len2 = parent2.assignments.length;
      const crossoverPoint = Math.floor(Math.random() * Math.min(len1, len2));

      const child: Timetable = {
        assignments: [
          ...parent1.assignments.slice(0, crossoverPoint),
          ...parent2.assignments.slice(crossoverPoint),
        ]
      };
      
      if (Math.random() < mutationRate && child.assignments.length > 0) {
        const randomIndex = Math.floor(Math.random() * child.assignments.length);
        const randomCourseId = child.assignments[randomIndex].courseId;
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        
        let roomChanged = false;
        for (let j = 0; j < child.assignments.length; j++) {
            if (child.assignments[j].courseId === randomCourseId) {
                const newRoomId = roomChanged ? child.assignments[j].roomId : randomRoom.id;
                roomChanged = true;
                
                child.assignments[j] = {
                    ...child.assignments[j],
                    timeslotId: randomTimeslot.id,
                    roomId: newRoomId
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