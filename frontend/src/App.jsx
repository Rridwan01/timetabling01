import { useState, useEffect } from "react";
import "normalize.css";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme/theme";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GlobalStyles } from "./styles/global/globalStyles";

import BaseLayout from "./components/layout/BaseLayout";
import Dashboard from "./screens/dashboard/DashboardScreen";
import CourseManagementScreen from "./screens/courseManagement/CourseManagementScreen";
import RoomManagementScreen from "./screens/roomManagement/RoomManagementScreen";
import ConstraintsScreen from "./screens/constraints/ConstraintsScreen";
import GenerateTimetableScreen from "./screens/generateTimetable/GenerateTimetableScreen";
import TimetableViewScreen from "./screens/timetableView/TimetableViewScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import NotFoundScreen from "./screens/notFound/NotFoundScreen";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is already logged in when they open the app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <GlobalStyles />
          
          {/* If NOT logged in, ONLY show the Login Screen */}
          {!isAuthenticated ? (
            <Routes>
              <Route path="*" element={<LoginScreen setAuth={setIsAuthenticated} />} />
            </Routes>
          ) : (
            /* If logged in, show the rest of the application */
            <Routes>
              <Route path="/" element={<BaseLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/course-management" element={<CourseManagementScreen />} />
                <Route path="/room-management" element={<RoomManagementScreen />} />
                <Route path="/constraints" element={<ConstraintsScreen />} />
                <Route path="/generate-timetable" element={<GenerateTimetableScreen />} />
                <Route path="/timetable-view" element={<TimetableViewScreen />} />
                
                {/* Fallback route - redirect unknown URLs to dashboard */}
                <Route path="*" element={<NotFoundScreen />} />
              </Route>
            </Routes>
          )}

        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;