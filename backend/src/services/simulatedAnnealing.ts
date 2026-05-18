// backend/src/services/simulatedAnnealing.ts
import { Timetable, Course, Room, Timeslot, TimetableConfig, ExamAssignment } from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

// Fast clone helper
export function cloneTimetable(timetable: Timetable): Timetable {
  const cloned: Record<number, ExamAssignment[]> = {};
  for (const courseId in timetable.courseAssignments) {
    cloned[courseId] = timetable.courseAssignments[courseId].map(a => ({ ...a }));
  }
  return { courseAssignments: cloned };
}

export function runSimulatedAnnealing(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  initialTimetable?: Timetable,
  conflictMatrix: ConflictMatrix,
  customIterations?: number // Added for Memetic short-bursts
): Timetable {
  
  const iterations = customIterations || (config.algorithm_tuning?.generations || 1000) * 20;
  let initialTemperature = 2.0; 
  let coolingRate = 0.999; 

  const availableRooms = rooms.filter(r => r.availability === 'Available');
  if (availableRooms.length === 0 || courses.length === 0 || timeslots.length === 0) {
      throw new Error("Insufficient data for SA.");
  }

  let currentSolution = initialTimetable ? cloneTimetable(initialTimetable) : generateRandomTimetable(courses, availableRooms, timeslots);
  let currentFitness = evaluateFitness(currentSolution, courses, rooms, timeslots, config, conflictMatrix);

  let bestSolution = cloneTimetable(currentSolution);
  let bestFitness = currentFitness;
  let temperature = initialTemperature;

  for (let i = 0; i < iterations; i++) {
    const neighborSolution = cloneTimetable(currentSolution);
    const courseIds = Object.keys(neighborSolution.courseAssignments).map(Number);
    
    if (courseIds.length === 0) break;

    const numPerturbations = Math.floor(Math.random() * 3) + 1; 

    for (let p = 0; p < numPerturbations; p++) {
        const randomCourseId = courseIds[Math.floor(Math.random() * courseIds.length)];
        const courseSchedule = neighborSolution.courseAssignments[randomCourseId];

        if (Math.random() < 0.5) {
            // Room Mutator: Change the room of ONE segment, ensuring it doesn't break atomic bounds
            const randomIdx = Math.floor(Math.random() * courseSchedule.length);
            const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
            courseSchedule[randomIdx].roomId = randomRoom.id;
        } else {
            // Timeslot Mutator: Move the ENTIRE course to a new timeslot
            const randomTimeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
            for (const segment of courseSchedule) {
                segment.timeslotId = randomTimeslot.id;
            }
        }
    }

    const neighborFitness = evaluateFitness(neighborSolution, courses, rooms, timeslots, config, conflictMatrix);
    const delta = neighborFitness - currentFitness;

    // ============================================================================
    // CRITICAL FIX: Standard Metropolis-Hastings Criterion
    // Removed the arbitrary "50" floor. The probability of accepting a worse 
    // solution is now purely a function of the temperature and how bad the move is.
    // ============================================================================
    let accept = false;
    
    if (delta > 0) {
        accept = true; // Always accept improvements
    } else {
        const probability = Math.exp(delta / Math.max(temperature, 0.0001));
        if (Math.random() < probability) {
            accept = true; // Accept worse solution to escape local optima
        }
    }

    if (accept) {
      currentSolution = neighborSolution;
      currentFitness = neighborFitness;

      if (currentFitness > bestFitness) {
        bestSolution = cloneTimetable(currentSolution);
        bestFitness = currentFitness;
      }
    }
    
    temperature *= coolingRate;
  }

  return bestSolution;
}