import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/timeslots
router.get('/', async (req, res) => {
  try {
    // We alias the columns to match what the React frontend expects (camelCase)
    const result = await query(`
      SELECT 
        id, 
        label, 
        start_time AS "startTime", 
        end_time AS "endTime", 
        date 
      FROM timeslots 
      ORDER BY date ASC, start_time ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timeslots:', error);
    res.status(500).json({ error: 'Failed to fetch timeslots.' });
  }
});

export default router;