import { useState } from "react";
import { CustomCalendarWrap } from "./CustomCalendar.styles";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { BlockTitle } from "../../../../styles/global/default";

const CustomCalendar = () => {
  const [date, setDate] = useState(new Date());
  
  return (
    <CustomCalendarWrap>
      <BlockTitle className="calendar-head">
        <h3 className="head-ttl">Exam Timeline</h3>
      </BlockTitle>
      <div className="calendar-body">
        <Calendar onChange={setDate} value={date} />
      </div>
    </CustomCalendarWrap>
  );
};

export default CustomCalendar;