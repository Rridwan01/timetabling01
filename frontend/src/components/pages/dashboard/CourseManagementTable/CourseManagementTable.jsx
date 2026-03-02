import { useState } from "react";
import { MdEdit, MdDelete, MdAdd, MdClose, MdCheck } from "react-icons/md";
import { BlockTableWrap, BlockTitle } from "../../../../styles/global/default";
import { CourseTableWrap } from "./CourseManagementTable.styles";

// Initial mock data tailored for the examination system
const INITIAL_DATA = [
  { id: 1, code: "SEN 401", name: "Software Engineering Project", level: "400L", students: 45, lecturer: "Dr. A.A. Waheed" },
  { id: 2, code: "SEN 412", name: "Computing Fundamentals", level: "400L", students: 120, lecturer: "Dr. V.B. Oyekunle" },
  { id: 3, code: "SEN 205", name: "Introduction to Cybersecurity", level: "200L", students: 85, lecturer: "Prof. O.O. Ojo" },
];

const CourseManagementTable = () => {
  const [courses, setCourses] = useState(INITIAL_DATA);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: "", name: "", level: "", students: "", lecturer: "" });

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open form for a NEW course
  const handleAddClick = () => {
    setFormData({ id: null, code: "", name: "", level: "", students: "", lecturer: "" });
    setShowForm(true);
  };

  // Open form to EDIT an existing course
  const handleEditClick = (course) => {
    setFormData(course);
    setShowForm(true);
  };

  // Delete a course
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  // Save (Add or Update)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (formData.id) {
      // Update existing course
      setCourses(courses.map((course) => (course.id === formData.id ? formData : course)));
    } else {
      // Add new course (generate a random ID)
      const newCourse = { ...formData, id: Date.now() };
      setCourses([...courses, newCourse]);
    }
    
    setShowForm(false); // Close form after saving
  };

  return (
    <CourseTableWrap>
      <BlockTitle className="course-table-head">
        <h3 className="head-ttl">Course List</h3>
        <button className="add-btn" onClick={handleAddClick}>
          <MdAdd size={20} />
          <span>Add Course</span>
        </button>
      </BlockTitle>

      {/* --- ADD / EDIT FORM --- */}
      {showForm && (
        <form className="course-form" onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Course Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. SEN 401" required />
            </div>
            <div className="form-group">
              <label>Course Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Software Engineering Project" required />
            </div>
            <div className="form-group">
              <label>Level</label>
              <input type="text" name="level" value={formData.level} onChange={handleInputChange} placeholder="e.g. 400L" required />
            </div>
            <div className="form-group">
              <label>Number of Students</label>
              <input type="number" name="students" value={formData.students} onChange={handleInputChange} placeholder="e.g. 45" required />
            </div>
            <div className="form-group lecturer-group">
              <label>Lecturer (Chief Examiner)</label>
              <input type="text" name="lecturer" value={formData.lecturer} onChange={handleInputChange} placeholder="e.g. Dr. A.A. Waheed" required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">
              <MdCheck size={20} /> Save
            </button>
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
              <MdClose size={20} /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* --- TABLE --- */}
      <div className="course-table-content">
        <div className="table-block scrollbar">
          <BlockTableWrap>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Level</th>
                <th>Students</th>
                <th>Lecturer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#A3AED0" }}>
                    No courses available. Add one above.
                  </td>
                </tr>
              ) : (
                courses.map((dataItem) => (
                  <tr key={dataItem.id}>
                    <td>{dataItem.code}</td>
                    <td>{dataItem.name}</td>
                    <td>{dataItem.level}</td>
                    <td>{dataItem.students}</td>
                    <td>{dataItem.lecturer}</td>
                    <td>
                      <div className="data-cell-actions">
                        <button type="button" className="edit-btn" aria-label="Edit course" onClick={() => handleEditClick(dataItem)}>
                          <MdEdit size={22} />
                        </button>
                        <button type="button" className="delete-btn" aria-label="Delete course" onClick={() => handleDeleteClick(dataItem.id)}>
                          <MdDelete size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </BlockTableWrap>
        </div>
      </div>
    </CourseTableWrap>
  );
};

export default CourseManagementTable;