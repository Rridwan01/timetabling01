import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchWithAuth } from "../../../../fetchWithAuth";
import { SummaryWrap } from "./Summary.styles";
import { BlockContentWrap } from "../../../../styles/global/default";
import { addSystemLog } from "../../../../utils/logger";
import {
  MdLibraryBooks,
  MdMeetingRoom,
  MdTune,
  MdCheckCircle,
  MdPlayArrow,
  MdDeleteForever,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Summary = ({ onAuthError }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalRooms: 0,
    totalCapacity: 0,
  });

  const [lastRunData, setLastRunData] = useState({
    date: "Never",
    fitness: "0.0",
    activeConstraints: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [coursesRes, roomsRes] = await Promise.all([
          fetchWithAuth("http://localhost:3000/api/courses", {}, onAuthError),
          fetchWithAuth("http://localhost:3000/api/rooms", {}, onAuthError),
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

    // Safely parse LocalStorage to prevent JSON.parse("undefined") crashes
    let savedTimetable = null;
    let savedConstraints = null;

    try {
      const timetableStr = localStorage.getItem("generated_timetable");
      const constraintsStr = localStorage.getItem("timetable_constraints");

      if (timetableStr && timetableStr !== "undefined") {
        savedTimetable = JSON.parse(timetableStr);
      }
      if (constraintsStr && constraintsStr !== "undefined") {
        savedConstraints = JSON.parse(constraintsStr);
      }
    } catch (e) {
      console.error("Error parsing timetable data from local storage:", e);
    }

    if (savedTimetable) {
      // Safely calculate constraints using Optional Chaining to prevent Object.values(undefined)
      const numHardConstraints = savedConstraints?.hard_constraints 
        ? Object.values(savedConstraints.hard_constraints).filter(Boolean).length 
        : 0;

      setLastRunData({
        date: new Date(
          savedTimetable.generatedAt || Date.now(),
        ).toLocaleDateString(),
        fitness:
          savedTimetable.fitnessScore && typeof savedTimetable.fitnessScore === "number"
            ? savedTimetable.fitnessScore.toFixed(1)
            : "0.0",
        activeConstraints: numHardConstraints > 0 ? numHardConstraints + 3 : 0, // Assuming 3 soft constraints
      });
    }
  }, [onAuthError]);

  // --- THE NUCLEAR RESET FUNCTION ---
  const handleResetSystem = async () => {
    const confirmReset = window.confirm(
      "⚠️ WARNING: This will permanently delete ALL courses, rooms, and previous timetables in the database. Are you absolutely sure you want to start fresh?",
    );

    if (confirmReset) {
      try {
        const response = await fetchWithAuth(
          "http://localhost:3000/api/timetable/reset",
          { method: "DELETE" },
          onAuthError,
        );

        if (response.ok) {
          // Clear the local browser memory
          localStorage.removeItem("timetable_constraints");
          localStorage.removeItem("generated_timetable");

          // Add the system log right before alerting and reloading
          addSystemLog(
            "<strong>Database Reset:</strong> All courses, rooms, and timetables wiped.",
            "warning",
          );

          alert("System wiped successfully. Ready for a fresh start!");
          window.location.reload(); 
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
              <div className="summary-block-val">
                {lastRunData.activeConstraints > 0
                  ? lastRunData.activeConstraints
                  : "None"}
              </div>
              <p className="summary-block-text">Applied on last run</p>
            </div>
          </BlockContentWrap>

          <BlockContentWrap className="dboard-block">
            <div className="summary-block-icon">
              <MdCheckCircle />
            </div>
            <div className="summary-block-details">
              <p className="summary-block-ttl">Last Generated</p>
              <div className="summary-block-val" style={{ fontSize: "18px" }}>
                {lastRunData.date}
              </div>
              <p className="summary-block-text">
                Fitness:{" "}
                <span className="text-percent">{lastRunData.fitness}%</span>
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

Summary.propTypes = {
  onAuthError: PropTypes.func,
};

export default Summary;