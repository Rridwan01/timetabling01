import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { query } from './db/index.js';
import timetableRouter from './routes/timetable.routes';
import courseRouter from './routes/course.routes';
import roomRouter from './routes/room.routes';
import authRoutes from './routes/auth.routes';
import { authenticateJWT } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

// 1. Auth routes (Unprotected so people can log in)
app.use('/api/auth', authRoutes);

// 2. Protected routes (Require valid JWT token)
app.use('/api/courses', authenticateJWT, courseRouter);
app.use('/api/rooms', authenticateJWT, roomRouter);
app.use('/api/timetable', authenticateJWT, timetableRouter);

app.get('/', (req, res) => {
  res.send('Examination Timetabling System Backend');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});