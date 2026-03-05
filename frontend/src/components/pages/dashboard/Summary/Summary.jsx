import { useState, useEffect } from "react";
import { SummaryWrap } from "./Summary.styles";
import { BlockContentWrap } from "../../../../styles/global/default";
import {
  MdLibraryBooks,
  MdMeetingRoom,
  MdTune,
  MdCheckCircle,
  MdPlayArrow,
  MdDeleteForever, // <-- New Icon for Reset
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Summary = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalRooms: 0,
    totalCapacity: 0,
  });

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [coursesRes, roomsRes] = await Promise.all([
          fetch("http://localhost:3000/api/courses", {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          fetch("http://localhost:3000/api/rooms", {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        if (coursesRes.ok && roomsRes.ok) {
          const courses = await coursesRes.json();
          const rooms = await roomsRes.json();
          const capacity = rooms.reduce(
            (sum, room) => sum + (room.capacity || 0),
            0,
          );

          setStats({
            totalCourses: courses.length,
            totalRooms: rooms.length,
            totalCapacity: capacity,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, []);

  // --- THE NUCLEAR RESET FUNCTION ---
  const handleResetSystem = async () => {
    const confirmReset = window.confirm(
      "⚠️ WARNING: This will permanently delete ALL courses, rooms, and previous timetables in the database. Are you absolutely sure you want to start fresh?",
    );

    if (confirmReset) {
      try {
        const response = await fetch(
          "http://localhost:3000/api/timetable/reset",
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );

        if (response.ok) {
          // Clear the local browser memory
          localStorage.removeItem("timetable_constraints");
          localStorage.removeItem("generated_timetable");

          alert("System wiped successfully. Ready for a fresh start!");
          window.location.reload(); // Refresh the page to zero out the stats instantly
        } else {
          alert("Failed to reset the database.");
        }
      } catch (error) {
        console.error("Reset error:", error);
      }
    }
  };

  return (
    <SummaryWrap>
      <div className="dash-board-content">
        <div className="dboard-blocks dboard-summary-blocks">
          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdLibraryBooks />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Total Courses</p>
              <div className="summary-block-val">{stats.totalCourses}</div>
            </div>
          </BlockContentWrap>

          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdMeetingRoom />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Total Rooms</p>
              <div className="summary-block-val">{stats.totalRooms}</div>
              <p className="summary-block-text">
                <span className="text-percent">
                  {stats.totalCapacity.toLocaleString()}
                </span>{" "}
                Total Capacity
              </p>
            </div>
          </BlockContentWrap>

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

          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdCheckCircle />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Last Generated</p>
              <div className="summary-block-val" style={{ fontSize: "18px" }}>
                Never
              </div>
              <p className="summary-block-text">
                Fitness: <span className="text-percent">0.0%</span>
              </p>
            </div>
          </BlockContentWrap>
        </div>

        <div className="generate-banner">
          <div className="banner-text">
            <h2>Ready to optimize the exam schedule?</h2>
            <p>
              Run the Genetic Algorithm engine to generate a clash-free
              timetable based on your latest courses, rooms, and constraints.
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              className="generate-btn"
              onClick={() => navigate("/generate-timetable")}
            >
              <MdPlayArrow size={24} />
              Generate New Timetable
            </button>

            {/* CLEANED UP RESET BUTTON */}
            <button className="reset-btn" onClick={handleResetSystem}>
              <MdDeleteForever size={24} />
              Wipe Data
            </button>
          </div>
        </div>
      </div>
    </SummaryWrap>
  );
};

export default Summary;
