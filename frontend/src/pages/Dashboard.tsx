import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface TimetableResult {
  timetable: Array<{ courseId: number; roomId: number; timeslotId: number }>;
  fitness: number;
  timeTaken: number;
}

const Dashboard: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'GA' | 'SA'>('GA');
  const [result, setResult] = useState<TimetableResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          populationSize: 50,
          generations: 100,
          mutationRate: 0.1,
          algorithm,
        }),
      });
      const data = await response.json();
      setResult({
        timetable: data.timetable.assignments,
        fitness: data.fitness,
        timeTaken: data.timeTaken,
      });
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Card style={{ marginBottom: '20px', padding: '20px' }}>
        <Typography variant="h6">Run Simulation</Typography>
        <FormControl component="fieldset" style={{ marginTop: '10px' }}>
          <RadioGroup
            row
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'GA' | 'SA')}
          >
            <FormControlLabel
              value="GA"
              control={<Radio color="primary" />}
              label="Genetic Algorithm"
            />
            <FormControlLabel
              value="SA"
              control={<Radio color="primary" />}
              label="Simulated Annealing"
            />
          </RadioGroup>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRunSimulation}
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          {loading ? 'Running...' : 'Run Simulation'}
        </Button>
      </Card>

      {result && (
        <div>
          <Card style={{ marginBottom: '20px', padding: '20px' }}>
            <Typography variant="h6">Metrics</Typography>
            <Typography>Fitness Score: {result.fitness}</Typography>
            <Typography>Time Taken: {result.timeTaken} ms</Typography>
          </Card>

          <Typography variant="h6" gutterBottom>
            Timetable
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timeslot</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Course</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.timetable.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell>{assignment.timeslotId}</TableCell>
                    <TableCell>{assignment.roomId}</TableCell>
                    <TableCell>{assignment.courseId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;