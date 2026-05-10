import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CustomCalendarWrap } from "./CustomCalendar.styles";
import { BlockTitle } from "../../../../styles/global/default";

const CustomCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [examDates, setExamDates] = useState(new Set());

  useEffect(() => {
    // 1. Pull the saved timetable and timeslots from local storage
    const savedTimetable = JSON.parse(
      localStorage.getItem("generated_timetable"),
    );
    const savedTimeslots = JSON.parse(
      localStorage.getItem("timetable_timeslots"),
    );

    if (savedTimetable && savedTimeslots) {
      const datesWithExams = new Set();

      // 2. Loop through assignments, find the matching timeslot, and extract the date
      savedTimetable.assignments.forEach((assignment) => {
        const slot = savedTimeslots.find((t) => t.id === assignment.timeslotId);
        if (slot && slot.date) {
          // Convert the ISO string to a standard date string for easy matching
          datesWithExams.add(new Date(slot.date).toDateString());
        }
      });

      setExamDates(datesWithExams);
    }
  }, []);

  // 3. This function runs for every tile on the calendar.
  // If the date exists in our Set, it applies a custom CSS class.
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
