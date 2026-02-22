import express from 'express';
import { generateTimetable } from '../controllers/runs.controller';

const router = express.Router();

// POST /generate route
router.post('/generate', generateTimetable);

export default router;