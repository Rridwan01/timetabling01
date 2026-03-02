import { Timetable, ExamAssignment, Timeslot, Course, Room, TimetableConfig } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

/**
 * Generates a neighbor timetable by randomly modifying one exam's room or timeslot.
 */
function generateNeighbor(
  timetable: Timetable,
  availableRooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  const newAssignments = [...timetable.assignments];
  const randomIndex = Math.floor(Math.random() * newAssignments.length);
  const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
  const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];

  newAssignments[randomIndex] = {
    ...newAssignments[randomIndex],
    timeslotId: randomTimeslot.id,
    roomId: randomRoom.id,
  };

  return { assignments: newAssignments };
}

/**
 * Runs the Simulated Annealing algorithm.
 */
export function runSimulatedAnnealing(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  
  // Map UI inputs to SA parameters
  const iterations = config.algorithm_tuning?.generations || 5000;
  let initialTemperature = 1000;
  let coolingRate = 0.95;
  
  if (config.algorithm_tuning?.mutationRate === "High") coolingRate = 0.99; // Cools slower, explores more
  if (config.algorithm_tuning?.mutationRate === "Low") coolingRate = 0.85; // Cools faster

  const availableRooms = rooms.filter(r => r.availability === 'Available');

  // Generate initial solution
  let currentSolution = generateRandomTimetable(courses, availableRooms, timeslots);
  let currentFitness = evaluateFitness(currentSolution, courses, rooms, timeslots, config);

  let bestSolution = currentSolution;
  let bestFitness = currentFitness;

  let temperature = initialTemperature;

  for (let i = 0; i < iterations; i++) {
    const neighborSolution = generateNeighbor(currentSolution, availableRooms, timeslots);
    const neighborFitness = evaluateFitness(neighborSolution, courses, rooms, timeslots, config);

    // Calculate the change in fitness
    const delta = neighborFitness - currentFitness;

    // Decide whether to accept the neighbor solution
    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      currentSolution = neighborSolution;
      currentFitness = neighborFitness;

      if (currentFitness > bestFitness) {
        bestSolution = currentSolution;
        bestFitness = currentFitness;
      }
    }

    temperature *= coolingRate;
  }

  return bestSolution;
}