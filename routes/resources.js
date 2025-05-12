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

  // Validate required fields
  if (!course_code || !description || !type || !link) {
    return res.status(400).json({ 
      message: 'Missing required fields',
      required: ['course_code', 'description', 'type', 'link']
    });
  }

  // Validate URL format
  try {
    new URL(link); // Will throw if invalid URL
  } catch (err) {
    return res.status(400).json({ 
      message: 'Invalid URL format',
      error: err.message
    });
  }

  try {
    // First verify the course exists
    const [course] = await pool.query(
      'SELECT course_code FROM courses WHERE course_code = ?', 
      [course_code]
    );
    
    if (course.length === 0) {
      return res.status(404).json({ 
        message: 'Course not found',
        course_code
      });
    }

    // Insert the resource
    const [result] = await pool.query(
      'INSERT INTO resources (course_code, description, publishers_name, type, link, vote) VALUES (?, ?, ?, ?, ?, ?)',
      [course_code, description, publishers_name || null, type, link, vote]
    );

    // Return the inserted resource data
    const [newResource] = await pool.query(
      'SELECT * FROM resources WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ 
      message: 'Resource added successfully',
      resource: newResource[0],
      insertedId: result.insertId
    });
  } catch (err) {
    console.error('Error adding resource:', err);
    
    // Handle duplicate entry (if link is unique)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'Resource already exists',
        error: err.message
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: err.message
    });
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
