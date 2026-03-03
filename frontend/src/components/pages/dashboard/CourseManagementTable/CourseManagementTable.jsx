import { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdAdd, MdClose, MdCheck } from "react-icons/md";
import { BlockTableWrap, BlockTitle } from "../../../../styles/global/default";
import { CourseTableWrap } from "./CourseManagementTable.styles";

const CourseManagementTable = () => {
  const [courses, setCourses] = useState([]); // Start empty, fetch from DB
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: "", title: "", level: "", num_students: "", lecturer: "" }); // Note: updated 'name' to 'title', 'students' to 'num_students' to match DB
  const [error, setError] = useState("");

  // Get token helper
  const getToken = () => localStorage.getItem("token");

  // 1. FETCH COURSES ON LOAD
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/courses", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open form for a NEW course
  const handleAddClick = () => {
    setFormData({ id: null, code: "", title: "", level: "", num_students: "", lecturer: "" });
    setShowForm(true);
    setError("");
  };

  // Open form to EDIT an existing course
  const handleEditClick = (course) => {
    setFormData({
       id: course.id,
       code: course.code,
       title: course.title,
       level: course.level,
       num_students: course.num_students,
       lecturer: course.lecturer
    });
    setShowForm(true);
    setError("");
  };

  // 2. DELETE COURSE
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (response.ok) {
          setCourses(courses.filter((course) => course.id !== id));
        } else {
          alert("Failed to delete course");
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  // 3. SAVE (ADD OR UPDATE) COURSE
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const isUpdate = formData.id !== null;
    const url = isUpdate 
        ? `http://localhost:3000/api/courses/${formData.id}` 
        : "http://localhost:3000/api/courses";
    const method = isUpdate ? "PUT" : "POST";

    // Ensure num_students is an integer
    const payload = {
        ...formData,
        num_students: parseInt(formData.num_students, 10)
    };
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}` 
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            fetchCourses(); // Refresh the list from the database
            setShowForm(false);
        } else {
            const data = await response.json();
            setError(data.error || "Failed to save course");
        }
    } catch (err) {
        setError("Network error. Is the backend running?");
    }
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
          {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Course Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. SEN 401" required />
            </div>
            <div className="form-group">
              <label>Course Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Software Engineering Project" required />
            </div>
            <div className="form-group">
              <label>Level</label>
              <input type="text" name="level" value={formData.level} onChange={handleInputChange} placeholder="e.g. 400L" required />
            </div>
            <div className="form-group">
              <label>Number of Students</label>
              <input type="number" name="num_students" value={formData.num_students} onChange={handleInputChange} placeholder="e.g. 45" required />
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
                <th>Course Title</th>
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
                    No courses available yet. Add one above.
                  </td>
                </tr>
              ) : (
                courses.map((dataItem) => (
                  <tr key={dataItem.id}>
                    <td>{dataItem.code}</td>
                    <td>{dataItem.title}</td>
                    <td>{dataItem.level}</td>
                    <td>{dataItem.num_students}</td>
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