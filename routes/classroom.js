import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all classrooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classroom');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
});

// Check if class_code is unique
router.get('/check-class-code/:code', async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM classroom WHERE UPPER(class_code) = ? LIMIT 1',
      [code]
    );
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error('Error checking class_code:', err);
    res.status(500).json({ error: 'Failed to check class code' });
  }
});

// Get a classroom by class_code
router.get('/:class_code', async (req, res) => {
  const { class_code } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM classroom WHERE class_code = ?', [class_code]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classroom' });
  }
});

// Add a new classroom
router.post('/', async (req, res) => {
  const { class_code, course_code, email, faculty_initial, section, semester } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO classroom (class_code, course_code, email, faculty_initial, section, semester) VALUES (?, ?, ?, ?, ?, ?)',
      [class_code, course_code, email, faculty_initial, section, semester]
    );
    res.status(201).json({ message: 'Classroom created', insertedId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

// Update a classroom by class_code
router.patch('/:class_code', async (req, res) => {
  const { class_code } = req.params;
  const { course_code, email, faculty_initial, section, semester } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE classroom SET 
        course_code = COALESCE(?, course_code), 
        email = COALESCE(?, email), 
        faculty_initial = COALESCE(?, faculty_initial), 
        section = COALESCE(?, section), 
        semester = COALESCE(?, semester) 
      WHERE class_code = ?`,
      [course_code, email, faculty_initial, section, semester, class_code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json({ message: 'Classroom updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update classroom' });
  }
});

// Delete a classroom by class_code
router.delete('/:class_code', async (req, res) => {
  const { class_code } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM classroom WHERE class_code = ?', [class_code]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    res.json({ message: 'Classroom deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
});

export default router;
