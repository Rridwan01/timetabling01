import {
  Timetable,
  Course,
  Room,
  Timeslot,
  TimetableConfig,
  ExamAssignment,
  flattenAssignments,
} from "../models/timetable";
import { evaluateFitness } from "./fitness";
import { generateRandomTimetable } from "./population";

// Fast cloning to eliminate JSON serialization overhead
function cloneTimetable(timetable: Timetable): Timetable {
  const clonedAssignments: Record<number, ExamAssignment[]> = {};
  for (const courseId in timetable.courseAssignments) {
    clonedAssignments[courseId] = timetable.courseAssignments[courseId].map(
      (a) => ({ ...a }),
    );
  }
  return { courseAssignments: clonedAssignments };
}

export function runGeneticAlgorithm(
  config: TimetableConfig,
  courses: Course[],
  rooms: Room[],
  timeslots: Timeslot[],
  conflictMatrix: ConflictMatrix
): Timetable {
  const popSize = 100;
  const generations = config.algorithm_tuning?.generations || 1000;

  let mutationRate = 0.05;
  if (config.algorithm_tuning?.mutationRate === "Low") mutationRate = 0.01;
  if (config.algorithm_tuning?.mutationRate === "High") mutationRate = 0.15;

  const availableRooms = rooms.filter((r) => r.availability === "Available");

  if (
    availableRooms.length === 0 ||
    courses.length === 0 ||
    timeslots.length === 0
  ) {
    throw new Error("Insufficient database records to generate timetable.");
  }

  let population: Timetable[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(
      generateRandomTimetable(courses, availableRooms, timeslots),
    );
  }

  let bestTimetable = cloneTimetable(population[0]);
  let bestFitness = evaluateFitness(
    bestTimetable,
    courses,
    rooms,
    timeslots,
    config,
    conflictMatrix
  );
  for (let generation = 0; generation < generations; generation++) {
    // Score and Sort (using the adapter to pass a flat array to the legacy fitness function)
    const scoredPopulation = population
      .map((timetable) => ({
        timetable,
        fitness: evaluateFitness(timetable, courses, rooms, timeslots, config, conflictMatrix),
      }))
      .sort((a, b) => b.fitness - a.fitness);

    // Track global best
    if (scoredPopulation[0].fitness > bestFitness) {
      bestFitness = scoredPopulation[0].fitness;
      bestTimetable = cloneTimetable(scoredPopulation[0].timetable);
    }

    const newPopulation: Timetable[] = [];

    // ELITISM: Pass the top schedules safely using fast clone
    const elitismCount = Math.min(2, scoredPopulation.length);
    for (let i = 0; i < elitismCount; i++) {
      newPopulation.push(cloneTimetable(scoredPopulation[i].timetable));
    }

    // Breed the rest of the population
    while (newPopulation.length < popSize) {
      // Tournament Selection
      const getParent = () => {
        const p1 =
          scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
        const p2 =
          scoredPopulation[Math.floor(Math.random() * scoredPopulation.length)];
        return p1.fitness > p2.fitness ? p1.timetable : p2.timetable;
      };

      const parent1 = getParent();
      const parent2 = getParent();

      // Whole-Course Uniform Crossover
      const childAssignments: Record<number, ExamAssignment[]> = {};
      for (const course of courses) {
        // 50% chance to inherit the full course schedule block from P1 or P2
        const inheritFromP1 = Math.random() > 0.5;
        const sourceAssignments = inheritFromP1
          ? parent1.courseAssignments[course.id]
          : parent2.courseAssignments[course.id];
        childAssignments[course.id] = sourceAssignments.map((a) => ({ ...a }));
      }

      const child: Timetable = { courseAssignments: childAssignments };

      // Course-Level Mutation
      if (Math.random() < mutationRate) {
        const randomCourse =
          courses[Math.floor(Math.random() * courses.length)];
        const targetAssignments = child.courseAssignments[randomCourse.id];

        // Move the entire split course to a new, random timeslot
        const randomTimeslot =
          timeslots[Math.floor(Math.random() * timeslots.length)];
        for (const assignment of targetAssignments) {
          assignment.timeslotId = randomTimeslot.id;
        }
      }

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return bestTimetable;
}
