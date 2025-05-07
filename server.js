import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/users.js'; // Modularized user routes
import courseRoutes from './routes/courses.js';
import resourceRoutes from './routes/resources.js';
import classroomRoutes from './routes/classroom.js';
import classresourcesRoutes from './routes/classResources.js';


dotenv.config();

const app = express();
const port = 8000;

// Middleware
app.use(cors(
// {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true
//   }
));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/users', userRoutes);                 // All /users-related routes
app.use('/courses', courseRoutes);             //courses related routes
app.use('/resources', resourceRoutes);         // resources related routes
app.use('/classroom', classroomRoutes);         // classroom related routes
app.use('/classresources', classresourcesRoutes);         // classroom related routes

// Root Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
