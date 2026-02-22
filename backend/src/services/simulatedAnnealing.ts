import { Timetable, ExamAssignment, Timeslot } from "../models/timetable";
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

interface SimulatedAnnealingConfig {
  initialTemperature: number;
  coolingRate: number;
  iterations: number;
}

/**
 * Generates a neighbor timetable by randomly modifying one exam's room or timeslot.
 * @param timetable The current timetable.
 * @param rooms List of rooms.
 * @param timeslots List of timeslots.
 * @returns A new timetable with one random modification.
 */
function generateNeighbor(
  timetable: Timetable,
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  const newAssignments = [...timetable.assignments];
  const randomIndex = Math.floor(Math.random() * newAssignments.length);
  const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
  const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

  newAssignments[randomIndex] = {
    ...newAssignments[randomIndex],
    timeslotId: randomTimeslot.id,
    roomId: randomRoom.id,
  };

  return { assignments: newAssignments };
}

/**
 * Runs the Simulated Annealing algorithm to generate an optimal timetable.
 * @param config Configuration for the Simulated Annealing algorithm.
 * @param courses List of courses.
 * @param rooms List of rooms.
 * @param timeslots List of timeslots.
 * @returns The best timetable found.
 */
export function runSimulatedAnnealing(
  config: SimulatedAnnealingConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[]
): Timetable {
  // Generate initial solution
  let currentSolution = generateRandomTimetable(courses, rooms, timeslots);
  let currentFitness = evaluateFitness(currentSolution, courses, rooms);

  let bestSolution = currentSolution;
  let bestFitness = currentFitness;

  let temperature = config.initialTemperature;

  for (let i = 0; i < config.iterations; i++) {
    // Generate a neighbor solution
    const neighborSolution = generateNeighbor(currentSolution, rooms, timeslots);
    const neighborFitness = evaluateFitness(neighborSolution, courses, rooms);

    // Calculate the change in fitness
    const delta = neighborFitness - currentFitness;

    // Decide whether to accept the neighbor solution
    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      currentSolution = neighborSolution;
      currentFitness = neighborFitness;

      // Update the best solution if the neighbor is better
      if (currentFitness > bestFitness) {
        bestSolution = currentSolution;
        bestFitness = currentFitness;
      }
    }

    // Cool down the temperature
    temperature *= config.coolingRate;
  }

  return bestSolution;
}