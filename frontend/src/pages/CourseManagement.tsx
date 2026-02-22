import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

interface Course {
  id: number;
  code: string;
  numStudents: number;
  durationMinutes: number;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', numStudents: 0, durationMinutes: 0 });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewCourse({ code: '', numStudents: 0, durationMinutes: 0 });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
      if (response.ok) {
        fetchCourses();
        handleClose();
      } else {
        console.error('Error adding course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  return (
    <div>
      <h1>Course Management</h1>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Course
      </Button>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Number of Students</TableCell>
              <TableCell>Duration (Minutes)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.numStudents}</TableCell>
                <TableCell>{course.durationMinutes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Code"
            fullWidth
            value={newCourse.code}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Number of Students"
            type="number"
            fullWidth
            value={newCourse.numStudents}
            onChange={(e) => setNewCourse({ ...newCourse, numStudents: parseInt(e.target.value, 10) })}
          />
          <TextField
            margin="dense"
            label="Duration (Minutes)"
            type="number"
            fullWidth
            value={newCourse.durationMinutes}
            onChange={(e) => setNewCourse({ ...newCourse, durationMinutes: parseInt(e.target.value, 10) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CourseManagement;