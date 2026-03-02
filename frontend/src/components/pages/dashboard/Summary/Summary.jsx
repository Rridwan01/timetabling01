import { SummaryWrap } from "./Summary.styles";
import { BlockContentWrap } from "../../../../styles/global/default";
import { 
  MdLibraryBooks, 
  MdMeetingRoom, 
  MdTune, 
  MdCheckCircle,
  MdPlayArrow
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Summary = () => {
  const navigate = useNavigate();

  return (
    <SummaryWrap>
      <div className="dash-board-content">
        {/* Top Metric Blocks */}
        <div className="dboard-blocks dboard-summary-blocks">
          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdLibraryBooks />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Total Courses</p>
              <div className="summary-block-val">145</div>
            </div>
          </BlockContentWrap>

          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdMeetingRoom />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Total Rooms</p>
              <div className="summary-block-val">24</div>
              <p className="summary-block-text">
                <span className="text-percent">4,200</span> Capacity
              </p>
            </div>
          </BlockContentWrap>

          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdTune />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Active Constraints</p>
              <div className="summary-block-val">12</div>
              <p className="summary-block-text">
                <span className="text-percent">3</span> Hard, 9 Soft
              </p>
            </div>
          </BlockContentWrap>

          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdCheckCircle />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Last Generated</p>
              <div className="summary-block-val" style={{ fontSize: "18px" }}>Oct 12, 2026</div>
              <p className="summary-block-text">
                Fitness: <span className="text-percent">98.5%</span>
              </p>
            </div>
          </BlockContentWrap>
        </div>

        {/* Generate Timetable Action Banner */}
        <div className="generate-banner">
          <div className="banner-text">
            <h2>Ready to optimize the exam schedule?</h2>
            <p>Run the Genetic Algorithm engine to generate a clash-free timetable based on your latest courses, rooms, and constraints.</p>
          </div>
          <button className="generate-btn" onClick={() => navigate('/generate-timetable')}>
            <MdPlayArrow size={24} />
            Generate New Timetable
          </button>
        </div>
      </div>
    </SummaryWrap>
  );
};

export default Summary;