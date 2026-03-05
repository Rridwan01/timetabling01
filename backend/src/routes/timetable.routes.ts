import express from 'express';
import { generateTimetable, resetSystem } from '../controllers/runs.controller.js';

const router = express.Router();

// POST /generate route
router.post('/generate', generateTimetable);

// DELETE /reset route (The Nuclear Button)
router.delete('/reset', resetSystem);

export default router;