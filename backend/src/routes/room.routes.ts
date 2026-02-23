import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM rooms');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new room
router.post('/', async (req, res) => {
  const { name, capacity } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await query(
      'INSERT INTO rooms (name, capacity) VALUES ($1, $2) RETURNING *',
      [name, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;