import express from 'express';
import { query } from '../db/index';

const router = express.Router();

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM rooms ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
});

// POST /api/rooms (Create)
router.post('/', async (req, res) => {
  const { name, capacity, availability } = req.body;
  
  if (!name || !capacity || !availability) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await query(
      'INSERT INTO rooms (name, capacity, availability) VALUES ($1, $2, $3) RETURNING *',
      [name, capacity, availability]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error adding room:', error);
    if (error.code === '23505') { // Postgres Unique Violation
        return res.status(400).json({ error: 'Room name already exists.' });
    }
    res.status(500).json({ error: 'Failed to add room.' });
  }
});

// PUT /api/rooms/:id (Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, capacity, availability } = req.body;

  try {
    const result = await query(
      'UPDATE rooms SET name = $1, capacity = $2, availability = $3 WHERE id = $4 RETURNING *',
      [name, capacity, availability, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room.' });
  }
});

// DELETE /api/rooms/:id (Delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM rooms WHERE id = $1', [id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room.' });
  }
});

export default router;