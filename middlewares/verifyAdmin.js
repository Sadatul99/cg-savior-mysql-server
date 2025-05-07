// middlewares/verifyAdmin.js
import pool from '../db.js';

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded?.email;

  if (!email) {
    return res.status(401).send({ message: 'unauthorized' });
  }

  try {
    const [rows] = await pool.query('SELECT role FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user?.role !== 'admin') {
      return res.status(403).send({ message: 'forbidden' });
    }

    next();
  } catch (err) {
    return res.status(500).send({ message: 'internal server error' });
  }
};

export default verifyAdmin;
