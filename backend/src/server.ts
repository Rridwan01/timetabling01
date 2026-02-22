import express from 'express';
import dotenv from 'dotenv';
import { query } from './db';
import timetableRouter from './routes/timetable.routes';
import courseRouter from './routes/course.routes';
import roomRouter from './routes/room.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the timetable, course, and room routers
app.use('/api/timetable', timetableRouter);
app.use('/api/courses', courseRouter);
app.use('/api/rooms', roomRouter);

app.get('/', (req, res) => {
  res.send('Examination Timetabling System Backend');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});