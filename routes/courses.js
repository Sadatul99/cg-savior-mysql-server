import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses');
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET course by ID (course_code)
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM courses WHERE course_code = ?', [code]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new course
router.post('/', async (req, res) => {
  const {
    course_code,
    course_title,
    pre_requisite,
    soft_pre_requisite,
    lab,
    credit,
    course_description
  } = req.body;

  try {
    await pool.query(
      'INSERT INTO courses (course_code, course_title, pre_requisite, soft_pre_requisite, lab, credit, course_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [course_code, course_title, pre_requisite, soft_pre_requisite, lab, credit, course_description]
    );
    res.status(201).json({ message: 'Course added successfully' });
  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE course by ID (course_code)
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM courses WHERE course_code = ?', [code]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH (update) course by ID (course_code)
router.patch('/:code', async (req, res) => {
  const { code } = req.params;
  const updates = req.body;

  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(code); // add course_code to the end for WHERE clause

    const [result] = await pool.query(
      `UPDATE courses SET ${setClause} WHERE course_code = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course updated successfully' });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
