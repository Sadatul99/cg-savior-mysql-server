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

  // Convert data types to match schema
  const labValue = lab === 'true' || lab === true;
  const creditValue = parseFloat(credit);

  // Handle empty optional fields
  const preReqValue = pre_requisite || null;
  const softPreReqValue = soft_pre_requisite || null;

  try {
    const [result] = await pool.query(
      'INSERT INTO courses (course_code, course_title, pre_requisite, soft_pre_requisite, lab, credit, course_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [course_code, course_title, preReqValue, softPreReqValue, labValue, creditValue, course_description]
    );
    
    // Return the course_code as insertedId since it's our primary key
    res.status(201).json({ 
      message: 'Course added successfully',
      insertedId: course_code // Return the course code as insertedId
    });
  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message // Include actual error message
    });
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

  // Validate updates object
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No fields provided for update' });
  }

  // Prepare fields and values with type conversion
  const fields = [];
  const values = [];
  
  // Handle each field with proper type conversion
  if (updates.course_code !== undefined) {
    fields.push('course_code = ?');
    values.push(updates.course_code);
  }
  
  if (updates.course_title !== undefined) {
    fields.push('course_title = ?');
    values.push(updates.course_title);
  }
  
  if (updates.pre_requisite !== undefined) {
    fields.push('pre_requisite = ?');
    values.push(updates.pre_requisite || null);
  }
  
  if (updates.soft_pre_requisite !== undefined) {
    fields.push('soft_pre_requisite = ?');
    values.push(updates.soft_pre_requisite || null);
  }
  
  if (updates.lab !== undefined) {
    fields.push('lab = ?');
    values.push(updates.lab === true || updates.lab === 'true');
  }
  
  if (updates.credit !== undefined) {
    fields.push('credit = ?');
    values.push(parseFloat(updates.credit));
  }
  
  if (updates.course_description !== undefined) {
    fields.push('course_description = ?');
    values.push(updates.course_description);
  }

  // Add course_code for WHERE clause
  values.push(code);

  try {
    const [result] = await pool.query(
      `UPDATE courses SET ${fields.join(', ')} WHERE course_code = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found or no changes made' });
    }

    // Return the updated course
    const [updatedCourse] = await pool.query('SELECT * FROM courses WHERE course_code = ?', [code]);
    res.json({ 
      message: 'Course updated successfully',
      course: updatedCourse[0],
      modifiedCount: result.affectedRows
    });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message
    });
  }
});

export default router;
