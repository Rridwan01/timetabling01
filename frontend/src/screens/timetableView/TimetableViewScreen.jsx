import { useState, useEffect } from "react";
import { BlockTitle, BlockContentWrap } from "../../styles/global/default";
import { MdPrint, MdDownload, MdPictureAsPdf } from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TimetableViewScreen = () => {
  const [scheduleData, setScheduleData] = useState(null);

  useEffect(() => {
    const loadTimetable = () => {
      const savedTimetableString = localStorage.getItem("generated_timetable");
      if (!savedTimetableString) return;

      try {
        const parsedData = JSON.parse(savedTimetableString);

        let flatTimetable = [];
        if (Array.isArray(parsedData)) {
          flatTimetable = parsedData; 
        } else if (parsedData && Array.isArray(parsedData.assignments)) {
          flatTimetable = parsedData.assignments; 
        } else {
          localStorage.removeItem("generated_timetable");
          return;
        }

        if (flatTimetable.length === 0) return;

        const groupedSchedule = {};
        flatTimetable.forEach(exam => {
          if (!groupedSchedule[exam.date]) groupedSchedule[exam.date] = {};
          if (!groupedSchedule[exam.date][exam.timeslotLabel]) {
            groupedSchedule[exam.date][exam.timeslotLabel] = [];
          }
          groupedSchedule[exam.date][exam.timeslotLabel].push(exam);
        });

        setScheduleData(groupedSchedule);
      } catch (err) {
        localStorage.removeItem("generated_timetable");
      }
    };

    loadTimetable();
  }, []);

  const handleExportCSV = () => {
    if (!scheduleData) return;
    let csvContent = "Date,Time,Session,Course Code,Course Title,Level,Students,Venue,Chief Examiner\n";

    Object.keys(scheduleData).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
      let prettyDate = date;
      if (!isNaN(new Date(date))) {
         prettyDate = new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      }
      
      ['Morning', 'Afternoon'].forEach(session => {
        if (scheduleData[date][session]) {
          scheduleData[date][session].forEach(exam => {
            const safeTitle = `"${exam.courseTitle.replace(/"/g, '""')}"`;
            const safeLecturer = `"${exam.lecturer.replace(/"/g, '""')}"`;
            const row = `"${prettyDate}","${exam.timeString}","${session}","${exam.courseCode}",${safeTitle},"${exam.level}","${exam.assignedStudents}","${exam.roomName}",${safeLecturer}`;
            csvContent += row + "\n";
          });
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Final_Exam_Timetable.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!scheduleData) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(43, 54, 116);
    doc.text("Lead City University, Ibadan", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Automated Examination Timetable", 14, 28);
    doc.setFontSize(10);
    doc.text("Supervised by: Dr. A.A. Waheed", 14, 34);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38); 

    let startY = 45;

    Object.keys(scheduleData).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
      let prettyDate = date;
      if (!isNaN(new Date(date))) {
         prettyDate = new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      }

      ['Morning', 'Afternoon'].forEach(session => {
        if (scheduleData[date][session]) {
          doc.setFontSize(11);
          doc.setTextColor(67, 97, 238);
          doc.text(`${prettyDate}  |  ${session} Session`, 14, startY);

          const tableData = scheduleData[date][session].map(exam => [
            `${exam.courseCode}\n(${exam.level})`,
            exam.timeString,
            exam.assignedStudents,
            exam.roomName,
            exam.lecturer
          ]);

          autoTable(doc, {
            startY: startY + 4,
            head: [['Course', 'Time', 'Capacity', 'Venue', 'Chief Examiner']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [67, 97, 238] },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: 14, right: 14 },
          });

          startY = doc.lastAutoTable.finalY + 15;

          if (startY > 270) {
            doc.addPage();
            startY = 20;
          }
        }
      });
    });

    doc.save("LCU_Exam_Timetable.pdf");
  };

  if (!scheduleData) {
    return (
      <div style={{ padding: '40px', color: '#fff', textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>No Valid Timetable Found</h2>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Please run the Generation Engine to see the schedule.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>Final Examination Schedule</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <MdPrint size={18} /> Print
          </button>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <MdDownload size={18} /> Export CSV
          </button>
          <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <MdPictureAsPdf size={18} /> Export PDF
          </button>
        </div>
      </div>

      {Object.keys(scheduleData).sort((a, b) => new Date(a) - new Date(b)).map(date => {
         let prettyDateHeader = date;
         if (!isNaN(new Date(date))) {
            prettyDateHeader = new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
         }

         return (
          <BlockContentWrap key={date} style={{ marginBottom: '24px', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' }}>
            <BlockTitle style={{ backgroundColor: '#f1f5f9', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>
                {prettyDateHeader}
              </h3>
            </BlockTitle>
            
            <div style={{ padding: '20px' }}>
              {['Morning', 'Afternoon'].map(session => {
                if (!scheduleData[date][session]) return null;
                
                return (
                  <div key={session} style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px', borderBottom: '2px solid #e0e7ff', paddingBottom: '4px' }}>
                      <h4 style={{ color: '#4361ee', margin: 0 }}>{session} Session</h4>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
                        {scheduleData[date][session][0].timeString}
                      </span>
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Course</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Level</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Students</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Venue</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Chief Examiner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleData[date][session].map((exam) => (
                          <tr key={exam.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#334155' }}>
                              {exam.courseCode} <br/><span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>{exam.courseTitle}</span>
                            </td>
                            <td style={{ padding: '12px', color: '#475569' }}>{exam.level}</td>
                            <td style={{ padding: '12px', color: '#475569' }}>{exam.assignedStudents}</td>
                            <td style={{ padding: '12px', color: '#475569', fontWeight: '500' }}>{exam.roomName}</td>
                            <td style={{ padding: '12px', color: '#475569' }}>{exam.lecturer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </BlockContentWrap>
        );
      })}
    </div>
  );
};

export default TimetableViewScreen;