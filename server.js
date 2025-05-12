import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import resourceRoutes from './routes/resources.js';
import classroomRoutes from './routes/classroom.js';
import classresourcesRoutes from './routes/classResources.js';
import authRoutes from './routes/auth.js'; // 🔥 Import JWT route

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors(/* optional CORS settings */));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/resources', resourceRoutes);
app.use('/classroom', classroomRoutes);
app.use('/classresources', classresourcesRoutes);
app.use(authRoutes); // 🔥 Mount JWT route

// Root Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
