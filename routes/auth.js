// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// JWT Token Generation
router.post('/jwt', (req, res) => {
  const user = req.body;

  if (!user || !user.email) {
    return res.status(400).json({ message: 'User email required for JWT' });
  }

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

export default router;
