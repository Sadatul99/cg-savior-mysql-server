import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all resources
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM resources');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET resources by course_code
router.get('/:course_code', async (req, res) => {
  const { course_code } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM resources WHERE course_code = ?', [course_code]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching course resources:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new resource
router.post('/', async (req, res) => {
  const { course_code, description, publishers_name, type, link, vote = 0 } = req.body;

  try {
    await pool.query(
      'INSERT INTO resources (course_code, description, publishers_name, type, link, vote) VALUES (?, ?, ?, ?, ?, ?)',
      [course_code, description, publishers_name, type, link, vote]
    );
    res.status(201).json({ message: 'Resource added successfully' });
  } catch (err) {
    console.error('Error adding resource:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE resource by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM resources WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
