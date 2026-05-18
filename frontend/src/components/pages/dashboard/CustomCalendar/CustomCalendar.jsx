import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CustomCalendarWrap } from "./CustomCalendar.styles";
import { BlockTitle } from "../../../../styles/global/default";

const CustomCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [examDates, setExamDates] = useState(new Set());

  useEffect(() => {
    let savedTimetable = null;
    let savedTimeslots = null;

    // 1. Safely parse local storage to prevent JSON.parse("undefined") crashes
    try {
      const timetableStr = localStorage.getItem("generated_timetable");
      const timeslotsStr = localStorage.getItem("timetable_timeslots");

      if (timetableStr && timetableStr !== "undefined") {
        savedTimetable = JSON.parse(timetableStr);
      }
      if (timeslotsStr && timeslotsStr !== "undefined") {
        savedTimeslots = JSON.parse(timeslotsStr);
      }
    } catch (e) {
      console.error("Error parsing calendar data from local storage:", e);
    }

    if (savedTimetable && Array.isArray(savedTimeslots)) {
      const datesWithExams = new Set();

      // 2. Safely extract assignments whether they are in an array or a Record object (Backend format)
      let flatAssignments = [];

      if (Array.isArray(savedTimetable.assignments)) {
        // If frontend flattened it into an array
        flatAssignments = savedTimetable.assignments;
      } else if (savedTimetable.courseAssignments) {
        // If it's still in the backend format: Record<number, ExamAssignment[]>
        flatAssignments = Object.values(savedTimetable.courseAssignments).flat();
      }

      // 3. Safely loop through the confirmed array
      flatAssignments.forEach((assignment) => {
        const slot = savedTimeslots.find((t) => t.id === assignment.timeslotId);
        if (slot && slot.date) {
          // Convert the ISO string to a standard date string for easy matching
          datesWithExams.add(new Date(slot.date).toDateString());
        }
      });

      setExamDates(datesWithExams);
    }
  }, []);

  // 4. This function runs for every tile on the calendar.
  const tileClassName = ({ date, view }) => {
    if (view === "month" && examDates.has(date.toDateString())) {
      return "highlight-exam-day";
    }
    return null;
  };

  return (
    <CustomCalendarWrap>
      <BlockTitle className="calendar-head">
        <h3 className="head-ttl">Exam Timeline</h3>
      </BlockTitle>
      <div className="calendar-body">
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={tileClassName}
        />
      </div>
    </CustomCalendarWrap>
  );
};

export default CustomCalendar;