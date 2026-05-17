import { Timetable, Course, Room, Timeslot, TimetableConfig } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

export function runSimulatedAnnealing(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  initialTimetable?: Timetable
): Timetable {
  
  // THE FIX: SA needs volume! Multiply generations by 20 so it evaluates enough schedules to compete with GA.
  const iterations = (config.algorithm_tuning?.generations || 1000) * 20;
  
  // Calibrated for percentage-based fitness (0 to 100)
  let initialTemperature = 2.0; 
  let coolingRate = 0.999; 

  const availableRooms = rooms.filter(r => r.availability === 'Available');
  if (availableRooms.length === 0 || courses.length === 0 || timeslots.length === 0) {
      throw new Error("Insufficient data for SA.");
  }

  let currentSolution = initialTimetable || generateRandomTimetable(courses, availableRooms, timeslots);
  let currentFitness = evaluateFitness(currentSolution, courses, rooms, timeslots, config);

  let bestSolution = JSON.parse(JSON.stringify(currentSolution));
  let bestFitness = currentFitness;
  let temperature = initialTemperature;

  for (let i = 0; i < iterations; i++) {
    const neighborSolution = JSON.parse(JSON.stringify(currentSolution));
    
    if (neighborSolution.assignments.length === 0) break;

    // THE FIX: "Gentle" Micro-Mutations instead of violent scrambling
    const mutationType = Math.random();

    if (mutationType < 0.5) {
        // Tweak 1: Change ONLY the room of a single split segment (Fixes Capacity/Double Booking)
        const randomIdx = Math.floor(Math.random() * neighborSolution.assignments.length);
        const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        neighborSolution.assignments[randomIdx].roomId = randomRoom.id;
    } else {
        // Tweak 2: Change ONLY the timeslot of a course, keeping it in the same rooms (Fixes Student Clashes)
        const randomCourseId = neighborSolution.assignments[Math.floor(Math.random() * neighborSolution.assignments.length)].courseId;
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        
        for (let j = 0; j < neighborSolution.assignments.length; j++) {
            if (neighborSolution.assignments[j].courseId === randomCourseId) {
                neighborSolution.assignments[j].timeslotId = randomTimeslot.id;
            }
        }
    }

    const neighborFitness = evaluateFitness(neighborSolution, courses, rooms, timeslots, config);
    const delta = neighborFitness - currentFitness;

    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      currentSolution = neighborSolution;
      currentFitness = neighborFitness;

      if (currentFitness > bestFitness) {
        bestSolution = JSON.parse(JSON.stringify(currentSolution));
        bestFitness = currentFitness;
      }
    }
    
    temperature *= coolingRate;
  }

  return bestSolution;
}