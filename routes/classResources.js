import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all class resources
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classResources');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class resources' });
  }
});

// GET class resources by class_code
router.get('/:class_code', async (req, res) => {
  const { class_code } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM classResources WHERE class_code = ?', [class_code]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class resources for the given class' });
  }
});

// POST a new class resource
router.post('/', async (req, res) => {
  const { class_code, course_code, description, type, link } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO classResources (class_code, course_code, description, type, link) VALUES (?, ?, ?, ?, ?)',
      [class_code, course_code, description, type, link]
    );
    res.status(201).json({ message: 'Class resource created', insertedId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class resource' });
  }
});

// DELETE class resource by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM classResources WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Class resource not found' });
    }
    res.json({ message: 'Class resource deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class resource' });
  }
});

export default router;
