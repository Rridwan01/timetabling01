import { useState, useEffect } from "react";
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
  
  // State to hold our dynamic database stats
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalRooms: 0,
    totalCapacity: 0
  });

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    // Fetch real data from the database when the dashboard loads
    const fetchDashboardStats = async () => {
      try {
        const [coursesRes, roomsRes] = await Promise.all([
          fetch("http://localhost:3000/api/courses", { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch("http://localhost:3000/api/rooms", { headers: { Authorization: `Bearer ${getToken()}` } })
        ]);

        if (coursesRes.ok && roomsRes.ok) {
          const courses = await coursesRes.json();
          const rooms = await roomsRes.json();

          // Calculate total capacity
          const capacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);

          setStats({
            totalCourses: courses.length,
            totalRooms: rooms.length,
            totalCapacity: capacity
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <SummaryWrap>
      <div className="dash-board-content">
        {/* Top Metric Blocks */}
        <div className="dboard-blocks dboard-summary-blocks">
          
          {/* DYNAMIC: Total Courses */}
          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdLibraryBooks />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Total Courses</p>
              <div className="summary-block-val">{stats.totalCourses}</div>
            </div>
          </BlockContentWrap>

          {/* DYNAMIC: Total Rooms & Capacity */}
          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdMeetingRoom />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Total Rooms</p>
              <div className="summary-block-val">{stats.totalRooms}</div>
              <p className="summary-block-text">
                <span className="text-percent">{stats.totalCapacity.toLocaleString()}</span> Total Capacity
              </p>
            </div>
          </BlockContentWrap>

          {/* STATIC FOR NOW (Until Algorithm Phase) */}
          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdTune />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Active Constraints</p>
              <div className="summary-block-val">8</div>
              <p className="summary-block-text">
                <span className="text-percent">3</span> Hard, 5 Soft
              </p>
            </div>
          </BlockContentWrap>

          {/* STATIC FOR NOW (Until Algorithm Phase) */}
          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdCheckCircle />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Last Generated</p>
              <div className="summary-block-val" style={{ fontSize: "18px" }}>Never</div>
              <p className="summary-block-text">
                Fitness: <span className="text-percent">0.0%</span>
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