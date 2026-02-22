import express from 'express';
import { query } from '../db';

const router = express.Router();

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, code, num_students AS "numStudents", duration_minutes AS "durationMinutes" FROM courses');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// POST /api/courses
router.post('/', async (req, res) => {
  const { code, numStudents, durationMinutes } = req.body;
  if (!code || !numStudents || !durationMinutes) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await query(
      'INSERT INTO courses (code, num_students, duration_minutes) VALUES ($1, $2, $3) RETURNING *',
      [code, numStudents, durationMinutes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Failed to add course.' });
  }
});

export default router;