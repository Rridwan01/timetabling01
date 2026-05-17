import {
  Timetable,
  ExamAssignment,
  Timeslot,
  Course,
  Room,
  TimetableConfig,
} from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

/**
 * Generates a neighbor timetable by randomly modifying one exam's room or timeslot.
 */
function generateNeighbor(
  timetable: Timetable,
  availableRooms: Room[],
  timeslots: Timeslot[],
): Timetable {
  const newAssignments = [...timetable.assignments];

  // Pick a random COURSE ID instead of a random assignment index
  const randomCourseId =
    newAssignments[Math.floor(Math.random() * newAssignments.length)].courseId;
  const randomTimeslot =
    timeslots[Math.floor(Math.random() * timeslots.length)];

  let roomChanged = false; // Only change one room per iteration to explore slowly

  for (let i = 0; i < newAssignments.length; i++) {
    // If this assignment belongs to our randomly picked course, move it!
    if (newAssignments[i].courseId === randomCourseId) {
      const newRoomId = roomChanged
        ? newAssignments[i].roomId
        : availableRooms[Math.floor(Math.random() * availableRooms.length)].id;

      roomChanged = true;

      newAssignments[i] = {
        ...newAssignments[i],
        timeslotId: randomTimeslot.id,
        roomId: newRoomId,
      };
    }
  }

  return { assignments: newAssignments };
}

/**
 * Runs the Simulated Annealing algorithm.
 */
export function runSimulatedAnnealing(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  initialTimetable?: Timetable // NEW: Make it accept an initial timetable
): Timetable {
  // Map UI inputs to SA parameters
  const iterations = config.algorithm_tuning?.generations || 5000;
  let initialTemperature = 1000;
  let coolingRate = 0.95;

  if (config.algorithm_tuning?.mutationRate === "High") coolingRate = 0.99; // Cools slower, explores more
  if (config.algorithm_tuning?.mutationRate === "Low") coolingRate = 0.85; // Cools faster

  const availableRooms = rooms.filter((r) => r.availability === "Available");

  // NEW: Use the provided timetable (from GA) OR generate a random one if running standalone SA
  let currentSolution = initialTimetable || generateRandomTimetable(
    courses,
    availableRooms,
    timeslots,
  );
  let currentFitness = evaluateFitness(
    currentSolution,
    courses,
    rooms,
    timeslots,
    config,
  );

  let bestSolution = currentSolution;
  let bestFitness = currentFitness;

  let temperature = initialTemperature;

  for (let i = 0; i < iterations; i++) {
    const neighborSolution = generateNeighbor(
      currentSolution,
      availableRooms,
      timeslots,
    );
    const neighborFitness = evaluateFitness(
      neighborSolution,
      courses,
      rooms,
      timeslots,
      config,
    );

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
