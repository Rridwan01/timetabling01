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
  
  const iterations = (config.algorithm_tuning?.generations || 1000) * 20;
  
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

    const numPerturbations = Math.floor(Math.random() * 3) + 1; 

    for (let p = 0; p < numPerturbations; p++) {
        const mutationType = Math.random();

        if (mutationType < 0.5) {
            // Room change
            const randomIdx = Math.floor(Math.random() * neighborSolution.assignments.length);
            const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
            neighborSolution.assignments[randomIdx].roomId = randomRoom.id;
        } else {
            // Timeslot change
            const randomCourseId = neighborSolution.assignments[Math.floor(Math.random() * neighborSolution.assignments.length)].courseId;
            
            // FIX 1: Timeslot selection moved strictly inside the perturbation loop
            // Each modified course now gets its own independent random timeslot
            const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
            
            for (let j = 0; j < neighborSolution.assignments.length; j++) {
                if (neighborSolution.assignments[j].courseId === randomCourseId) {
                    neighborSolution.assignments[j].timeslotId = randomTimeslot.id;
                }
            }
        }
    }

    const neighborFitness = evaluateFitness(neighborSolution, courses, rooms, timeslots, config);
    const delta = neighborFitness - currentFitness;

    // FIX 2: Clash Prevention Logic (The Safety Floor)
    let accept = false;
    
    if (delta > 0) {
        // Always accept if the schedule is improving
        accept = true; 
    } else if (neighborFitness >= 50) {
        // SA won't accept backward moves if the fitness is below 50 (indicating severe hard clashes)
        // It will only explore worse options if the schedule is already relatively stable
        if (Math.random() < Math.exp(Math.max(-50, delta / Math.max(temperature, 0.01)))) {
            accept = true;
        }
    }

    if (accept) {
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