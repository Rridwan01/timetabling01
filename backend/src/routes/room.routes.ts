import express from 'express';
import { query } from '../db';

const router = express.Router();

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, name, capacity FROM rooms');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
});

// POST /api/rooms
router.post('/', async (req, res) => {
  const { name, capacity } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await query(
      'INSERT INTO rooms (name, capacity) VALUES ($1, $2) RETURNING *',
      [name, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ error: 'Failed to add room.' });
  }
});

export default router;