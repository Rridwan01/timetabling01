import express from 'express';
import dotenv from 'dotenv';
import { query } from './db';
import timetableRouter from './routes/timetable.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the timetable router
app.use('/api/timetable', timetableRouter);

app.get('/', (req, res) => {
  res.send('Examination Timetabling System Backend');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});