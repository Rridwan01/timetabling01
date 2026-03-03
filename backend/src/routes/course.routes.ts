import express from 'express';
import { query } from '../db/index';

const router = express.Router();

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    // Fetch all columns to match the new examination schema
    const result = await query('SELECT * FROM courses ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// POST /api/courses (Create)
router.post('/', async (req, res) => {
  const { code, title, level, num_students, lecturer } = req.body;
  
  // Validate against the new fields
  if (!code || !title || !level || !num_students || !lecturer) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await query(
      'INSERT INTO courses (code, title, level, num_students, lecturer) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code, title, level, num_students, lecturer]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error adding course:', error);
    if (error.code === '23505') { // Postgres Unique Violation
        return res.status(400).json({ error: 'Course code already exists.' });
    }
    res.status(500).json({ error: 'Failed to add course.' });
  }
});

// PUT /api/courses/:id (Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { code, title, level, num_students, lecturer } = req.body;

  try {
    const result = await query(
      'UPDATE courses SET code = $1, title = $2, level = $3, num_students = $4, lecturer = $5 WHERE id = $6 RETURNING *',
      [code, title, level, num_students, lecturer, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

// DELETE /api/courses/:id (Delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

export default router;