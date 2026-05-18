import express from 'express';
import { generateTimetable, getJobStatus, resetSystem } from '../controllers/runs.controller.js';

const router = express.Router();

// POST /generate route
router.post('/generate', generateTimetable);

// DELETE /reset route (The Nuclear Button)
router.delete('/reset', resetSystem);

router.get("/status/:jobId", getJobStatus);

export default router;