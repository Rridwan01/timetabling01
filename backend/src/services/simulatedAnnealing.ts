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
  
  const iterations = config.algorithm_tuning?.generations || 1000;
  
  // ISSUE 2 FIX: Dynamic parameters based on user mutation rate setting
  let initialTemperature = config.algorithm_tuning?.mutationRate === "High" ? 5000 : 1000;
  let coolingRate = config.algorithm_tuning?.mutationRate === "Low" ? 0.85 : 0.95;

  const availableRooms = rooms.filter(r => r.availability === 'Available');
  if (availableRooms.length === 0 || courses.length === 0 || timeslots.length === 0) {
      throw new Error("Insufficient data for SA.");
  }

  let currentSolution = initialTimetable || generateRandomTimetable(courses, availableRooms, timeslots);
  let currentFitness = evaluateFitness(currentSolution, courses, rooms, timeslots, config);

  // Deep copy to protect the best state
  let bestSolution = JSON.parse(JSON.stringify(currentSolution));
  let bestFitness = currentFitness;
  let temperature = initialTemperature;

  for (let i = 0; i < iterations; i++) {
    const neighborSolution = JSON.parse(JSON.stringify(currentSolution));
    
    // ISSUE 1 FIX: Expand Search Space (Perturb 1 to 3 random courses instead of just 1)
    const numPerturbations = Math.floor(Math.random() * 3) + 1; 

    for (let p = 0; p < numPerturbations; p++) {
        if (neighborSolution.assignments.length === 0) break;
        
        const randomCourseId = neighborSolution.assignments[Math.floor(Math.random() * neighborSolution.assignments.length)].courseId;
        const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
        
        for (let j = 0; j < neighborSolution.assignments.length; j++) {
            if (neighborSolution.assignments[j].courseId === randomCourseId) {
                const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
                // Safely update all split segments
                neighborSolution.assignments[j].timeslotId = randomTimeslot.id;
                neighborSolution.assignments[j].roomId = randomRoom.id;
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