import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CourseManagement from './pages/CourseManagement';
import RoomManagement from './pages/RoomManagement';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/rooms" element={<RoomManagement />} />
      </Routes>
    </Router>
  );
};

export default App;