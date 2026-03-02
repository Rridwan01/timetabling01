import React from "react";
import { CourseManagement } from "./CourseManagementScreen.styles";
import CourseManagementTable from "../../components/pages/dashboard/CourseManagementTable/CourseManagementTable"; 

const CourseManagementScreen = () => {
  return (
    <CourseManagement>
      <div className="screen-header">
        <p>Manage your university courses, assign lecturers, and track durations here.</p>
      </div>

      <div className="table-container">
        <CourseManagementTable />
      </div>
    </CourseManagement>
  );
};

export default CourseManagementScreen;