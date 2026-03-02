import "normalize.css";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme/theme";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GlobalStyles } from "./styles/global/globalStyles";
import BaseLayout from "./components/layout/BaseLayout";
import Dashboard from "./screens/dashboard/DashboardScreen";
import CourseManagementScreen from "./screens/courseManagement/CourseManagementScreen";
import RoomManagementScreen from "./screens/roomManagement/RoomManagementScreen";
import ConstraintsScreen from "./screens/constraints/ConstraintsScreen";
import GenerateTimetableScreen from "./screens/generateTimetable/GenerateTimetableScreen";
import TimetableViewScreen from "./screens/timetableView/TimetableViewScreen";

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <GlobalStyles />
          {/* Removed the hardcoded flex div and Sidebar from here */}
          <Routes>
            <Route path="/" element={<BaseLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/course-management" element={<CourseManagementScreen />} />
              <Route path="/room-management" element={<RoomManagementScreen />} />
              <Route path="/constraints" element={<ConstraintsScreen />} />
              <Route path="/generate-timetable" element={<GenerateTimetableScreen />} />
              <Route path="/timetable-view" element={<TimetableViewScreen />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;