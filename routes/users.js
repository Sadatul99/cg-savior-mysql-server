import express from 'express';
import pool from '../db.js';
// import verifyToken from '../middlewares/verifyToken.js';
// import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Check if email is admin
router.get('/admin/:email', async (req, res) => {
  const email = req.params.email;

  if (email !== req.decoded.email) {
    return res.status(403).json({ message: 'forbidden access' });
  }

  const [rows] = await pool.query('SELECT role FROM users WHERE email = ?', [email]);
  const admin = rows[0]?.role === 'admin';
  res.json({ admin });
});

// Check if email is faculty
router.get('/faculty/:email', async (req, res) => {
  const email = req.params.email;

  if (email !== req.decoded.email) {
    return res.status(403).json({ message: 'forbidden access' });
  }

  const [rows] = await pool.query('SELECT role FROM users WHERE email = ?', [email]);
  const faculty = rows[0]?.role === 'faculty';
  res.json({ faculty });
});

// Create user if not exists
router.post('/', async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.json({ message: 'user already exists', insertedId: null });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role || 'user']
    );

    res.json({ insertedId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Insert failed' });
  }
});

// Delete user
router.delete('/:id',  async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Update user role
router.patch('/role/:id', async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

export default router;
