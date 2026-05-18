import { Request, Response } from "express";
import { query } from "../db/index";
import { TimetableConfig, Course, ConflictMatrix } from "../models/timetable";
import { timetableQueue } from "../queues/timetable.queue";

// ==========================================
// NEW: Database-Driven Conflict Matrix
// ==========================================
async function buildRealConflictMatrix(courses: Course[]): Promise<ConflictMatrix> {
    const matrix: ConflictMatrix = {};
    
    // Initialize empty matrix
    for (const course of courses) {
        matrix[course.id] = {};
    }

    // SQL query to find exact student overlaps between courses
    const overlapQuery = `
        SELECT r1.course_id AS c1, r2.course_id AS c2, COUNT(*) AS overlap
        FROM student_course_registrations r1
        JOIN student_course_registrations r2 ON r1.student_id = r2.student_id
        WHERE r1.course_id != r2.course_id
        GROUP BY r1.course_id, r2.course_id;
    `;

    try {
        const { rows } = await query(overlapQuery);

        for (const row of rows) {
            // Safety check to ensure the courses exist in our current fetch
            if (matrix[row.c1] && matrix[row.c2]) {
                matrix[row.c1][row.c2] = Number(row.overlap);
            }
        }
    } catch (error) {
        console.warn("⚠️ Could not fetch student registrations. Have you run the Phase 5 DB migration? Proceeding with zero-conflict matrix.");
    }

    return matrix;
}

export const generateTimetable = async (req: Request, res: Response) => {
  const { hard_constraints, soft_constraints, algorithm_tuning } = req.body;

  if (!hard_constraints || !soft_constraints || !algorithm_tuning) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const config: TimetableConfig = { hard_constraints, soft_constraints, algorithm_tuning };
  const algorithm = algorithm_tuning.engine;
  const adminId = 1; // Assuming default admin

  try {
    // 1. Fetch raw data
    const coursesResult = await query(`SELECT id, code, title, level, num_students AS "numStudents", lecturer FROM courses`);
    const roomsResult = await query(`SELECT id, name, capacity, availability FROM rooms`);
    const timeslotsResult = await query(`SELECT id, label, date, start_time AS "startTime", end_time AS "endTime" FROM timeslots`);

    const courses = coursesResult.rows;
    const rooms = roomsResult.rows;
    const timeslots = timeslotsResult.rows;

    if (courses.length === 0 || rooms.length === 0 || timeslots.length === 0) {
      return res.status(400).json({ error: "Insufficient database data." });
    }

    // 2. Build the Real Conflict Matrix
    const conflictMatrix = await buildRealConflictMatrix(courses);

    // 3. Dispatch Job to BullMQ (Background Worker)
    const job = await timetableQueue.add('generate', {
        config,
        courses,
        rooms,
        timeslots,
        conflictMatrix,
        adminId,
        algorithm
    });

    // 4. Immediately return the Job ID so the UI doesn't hang
    res.status(202).json({
      message: "Optimization started in the background.",
      jobId: job.id 
    });

  } catch (error) {
    console.error("Error queueing timetable:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ==========================================
// NEW: Check Job Status (For UI Polling)
// ==========================================
export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const job = await timetableQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const state = await job.getState();
        const progress = job.progress;

        if (state === 'completed') {
            // Worker finished, return the final timetable payload
            return res.json({
                status: 'completed',
                progress: 100,
                result: job.returnvalue
            });
        }

        if (state === 'failed') {
            return res.status(500).json({
                status: 'failed',
                error: job.failedReason
            });
        }

        // Job is still running (active, waiting, etc)
        return res.json({
            status: state, 
            progress: progress || 0
        });

    } catch (error) {
        console.error("Error fetching job status:", error);
        res.status(500).json({ error: "Failed to check job status" });
    }
};

export const resetSystem = async (req: Request, res: Response) => {
  try {
    // Included the new tables in the truncation list to be safe
    await query("TRUNCATE TABLE assignments, timetable_runs, run_configs, student_course_registrations, students, courses, rooms, timeslots RESTART IDENTITY CASCADE");
    res.json({ message: "System completely reset." });
  } catch (error) {
    console.error("Reset Error:", error);
    res.status(500).json({ error: "Failed to reset." });
  }
};