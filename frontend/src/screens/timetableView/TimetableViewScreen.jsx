import React, { useState } from "react";
import { TimetableViewWrap } from "./TimetableViewScreen.styles";
import { 
  MdDownload, 
  MdTableView, 
  MdCalendarMonth, 
  MdWarning, 
  MdInsights,
  MdCheckCircle
} from "react-icons/md";
import { FaFileCsv, FaFilePdf } from "react-icons/fa6";

// Mock Data for the generated timetable
const TIMETABLE_DATA = [
  { id: 1, date: "Mon, 12 Oct 2026", time: "09:00 AM - 11:00 AM", code: "SEN 401", title: "Software Engineering Project", level: "400L", room: "Hall A", invigilator: "Dr. A.A. Waheed", conflict: false },
  { id: 2, date: "Mon, 12 Oct 2026", time: "01:00 PM - 03:00 PM", code: "SEN 412", title: "Computing Fundamentals", level: "400L", room: "Hall B", invigilator: "Dr. V.B. Oyekunle", conflict: false },
  { id: 3, date: "Tue, 13 Oct 2026", time: "09:00 AM - 11:00 AM", code: "SEN 205", title: "Introduction to Cybersecurity", level: "200L", room: "LT 1", invigilator: "Prof. O.O. Ojo", conflict: false },
  { id: 4, date: "Tue, 13 Oct 2026", time: "09:00 AM - 11:00 AM", code: "SEN 301", title: "Data Structures", level: "300L", room: "LT 1", invigilator: "Dr. S.A. Smith", conflict: true, conflictReason: "Room Double Booked (LT 1)" },
  { id: 5, date: "Wed, 14 Oct 2026", time: "09:00 AM - 11:00 AM", code: "SEN 405", title: "Artificial Intelligence", level: "400L", room: "Hall A", invigilator: "Dr. A.A. Waheed", conflict: false },
];

const TimetableViewScreen = () => {
  const [viewMode, setViewMode] = useState("table");

  const handleExportCSV = () => {
    alert("Exporting timetable data to CSV format...");
    // Future logic: Convert JSON to CSV string and trigger download
  };

  const handleExportPDF = () => {
    alert("Generating PDF Document...");
    // Future logic: Use a library like jspdf to render the table as a PDF
  };

  return (
    <TimetableViewWrap>
      {/* Header & Export Actions */}
      <div className="screen-header">
        <div className="header-text">
          <h1>Generated Timetable</h1>
          <p>Review the optimized examination schedule and export reports.</p>
        </div>
        <div className="export-actions">
          <button className="btn-csv" onClick={handleExportCSV}>
            <FaFileCsv size={18} /> Export CSV
          </button>
          <button className="btn-pdf" onClick={handleExportPDF}>
            <FaFilePdf size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* Algorithm Performance Comparison */}
      <div className="performance-comparison">
        <div className="perf-card perf-summary-card">
          <h3 className="perf-title"><MdInsights size={20} /> Optimization Report</h3>
          <p className="summary-text">
            The <strong>Genetic Algorithm (GA)</strong> outperformed Simulated Annealing by achieving a higher fitness score in fewer iterations. 1 minor conflict requires manual review.
          </p>
        </div>

        <div className="perf-card">
          <h3 className="perf-title">Genetic Algorithm (Winner)</h3>
          <div className="perf-stats">
            <div className="stat-group">
              <span className="stat-val winner">98.5%</span>
              <span className="stat-lbl">Fitness Score</span>
            </div>
            <div className="stat-group">
              <span className="stat-val">45s</span>
              <span className="stat-lbl">Exec. Time</span>
            </div>
            <div className="stat-group">
              <span className="stat-val">850</span>
              <span className="stat-lbl">Iterations</span>
            </div>
          </div>
        </div>

        <div className="perf-card">
          <h3 className="perf-title">Simulated Annealing</h3>
          <div className="perf-stats">
            <div className="stat-group">
              <span className="stat-val loser">92.1%</span>
              <span className="stat-lbl">Fitness Score</span>
            </div>
            <div className="stat-group">
              <span className="stat-val">1m 12s</span>
              <span className="stat-lbl">Exec. Time</span>
            </div>
            <div className="stat-group">
              <span className="stat-val">2500</span>
              <span className="stat-lbl">Iterations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid Section */}
      <div className="timetable-container">
        <div className="table-controls">
          <div className="view-toggles">
            <button 
              className={viewMode === "table" ? "active" : ""} 
              onClick={() => setViewMode("table")}
            >
              <MdTableView size={18} /> Table View
            </button>
            <button 
              className={viewMode === "calendar" ? "active" : ""} 
              onClick={() => setViewMode("calendar")}
            >
              <MdCalendarMonth size={18} /> Calendar View
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="table-block scrollbar">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Course Details</th>
                  <th>Level</th>
                  <th>Room</th>
                  <th>Chief Examiner</th>
                </tr>
              </thead>
              <tbody>
                {TIMETABLE_DATA.map((row) => (
                  <tr key={row.id} className={row.conflict ? "conflict-row" : ""}>
                    <td>{row.date}</td>
                    <td>{row.time}</td>
                    <td>
                      <span className="course-code">{row.code}</span>
                      <span className="course-title">{row.title}</span>
                      {row.conflict && (
                        <div className="conflict-badge">
                          <MdWarning size={14} /> {row.conflictReason}
                        </div>
                      )}
                    </td>
                    <td>{row.level}</td>
                    <td>{row.room}</td>
                    <td>{row.invigilator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#A3AED0" }}>
            <MdCalendarMonth size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <h3>Calendar View is currently under construction.</h3>
            <p>Please use the Table View to review the generated schedule.</p>
          </div>
        )}
      </div>
    </TimetableViewWrap>
  );
};

export default TimetableViewScreen;