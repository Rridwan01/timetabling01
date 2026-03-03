import React, { useState, useEffect } from "react";
import { TimetableViewWrap } from "./TimetableViewScreen.styles";
import { MdDownload, MdPictureAsPdf, MdGridOn } from "react-icons/md";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TimetableViewScreen = () => {
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get the Raw Generated Timetable from Phase 2
      const rawSchedule = JSON.parse(localStorage.getItem("generated_timetable"));
      
      if (!rawSchedule || !rawSchedule.assignments) {
        setIsLoading(false);
        return; // No timetable has been generated yet
      }

      // 2. Fetch the Context (Names of Courses, Rooms, and Timeslots)
      const token = localStorage.getItem("token");
      const [coursesRes, roomsRes, timeslotsRes] = await Promise.all([
        fetch("http://localhost:3000/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3000/api/rooms", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3000/api/timeslots", { headers: { Authorization: `Bearer ${token}` } }) // We need to add this route next!
      ]);

      if (coursesRes.ok && roomsRes.ok && timeslotsRes.ok) {
        const coursesData = await coursesRes.json();
        const roomsData = await roomsRes.json();
        const timeslotsData = await timeslotsRes.json();

        setCourses(coursesData);
        setRooms(roomsData);
        setTimeslots(timeslotsData);

        // 3. Map IDs to actual names for display
        const formattedSchedule = rawSchedule.assignments.map(assignment => {
          const course = coursesData.find(c => c.id === assignment.courseId) || {};
          const room = roomsData.find(r => r.id === assignment.roomId) || {};
          const timeslot = timeslotsData.find(t => t.id === assignment.timeslotId) || {};

          return {
            courseCode: course.code,
            courseTitle: course.title,
            level: course.level,
            lecturer: course.lecturer,
            roomName: room.name,
            date: timeslot.date ? new Date(timeslot.date).toLocaleDateString() : 'N/A',
            time: timeslot.label || `${timeslot.startTime} - ${timeslot.endTime}`,
          };
        });

        // Sort by Date, then Time, then Level
        formattedSchedule.sort((a, b) => {
           if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
           if (a.time !== b.time) return a.time.localeCompare(b.time);
           return a.level.localeCompare(b.level);
        });

        setSchedule(formattedSchedule);
      }
    } catch (error) {
      console.error("Error formatting timetable:", error);
    }
    setIsLoading(false);
  };

  const exportPDF = () => {
    if (schedule.length === 0) return alert("No timetable data to export.");

    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(18);
    doc.setTextColor(43, 54, 116); // Your dark blue
    doc.text("Official Examination Timetable", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare table data
    const tableColumn = ["Date", "Time", "Level", "Course Code", "Course Title", "Hall / Room", "Chief Examiner"];
    const tableRows = [];

    schedule.forEach(item => {
      const rowData = [
        item.date,
        item.time,
        item.level,
        item.courseCode,
        item.courseTitle,
        item.roomName,
        item.lecturer
      ];
      tableRows.push(rowData);
    });

    // AutoTable plugin
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 24, 255] }, // Your primary purple
      alternateRowStyles: { fillColor: [244, 247, 254] },
    });

    doc.save("Exam_Timetable_Schedule.pdf");
  };

  return (
    <TimetableViewWrap>
      <div className="view-header">
        <div className="header-text">
          <h1><MdGridOn /> Final Timetable Schedule</h1>
          <p>Review the optimized schedule below or export it for distribution.</p>
        </div>
        <button className="export-btn" onClick={exportPDF} disabled={schedule.length === 0}>
          <MdPictureAsPdf size={20} />
          Export as PDF
        </button>
      </div>

      <div className="table-container scrollbar">
        {isLoading ? (
          <div className="empty-state">Loading generated schedule...</div>
        ) : schedule.length === 0 ? (
          <div className="empty-state">
            <h3>No timetable generated yet</h3>
            <p>Go to the Generation Engine to run the algorithm first.</p>
          </div>
        ) : (
          <table className="timetable-grid">
            <thead>
              <tr>
                <th>Date</th>
                <th>Session Time</th>
                <th>Level</th>
                <th>Course</th>
                <th>Hall Allocation</th>
                <th>Chief Examiner</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, index) => (
                <tr key={index}>
                  <td className="font-bold">{row.date}</td>
                  <td>{row.time}</td>
                  <td><span className="level-badge">{row.level}</span></td>
                  <td>
                    <div className="course-info">
                      <span className="course-code">{row.courseCode}</span>
                      <span className="course-title">{row.courseTitle}</span>
                    </div>
                  </td>
                  <td className="room-cell">{row.roomName}</td>
                  <td>{row.lecturer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </TimetableViewWrap>
  );
};

export default TimetableViewScreen;