import React, { useState } from "react";
import { ConstraintsWrap } from "./ConstraintsScreen.styles";
import { MdSave } from "react-icons/md";

const ConstraintsScreen = () => {
  const savedConfig = JSON.parse(localStorage.getItem("timetable_constraints")) || {};

  const [hardConstraints, setHardConstraints] = useState(savedConfig.hard_constraints || {
    studentClash: true,
    roomCapacity: true,
    chiefExaminerClash: true,
  });

  const [softConstraints, setSoftConstraints] = useState(savedConfig.soft_constraints || {
    examSpread: 5,
    dailyLimit: 2,
    roomUtilization: 3,
  });

  const [algoTuning, setAlgoTuning] = useState(savedConfig.algorithm_tuning || {
    engine: "Genetic Algorithm",
    generations: 1000,
    mutationRate: "Medium",
  });

  // Handlers
  const handleHardToggle = (key) => {
    setHardConstraints({ ...hardConstraints, [key]: !hardConstraints[key] });
  };

  const handleSoftChange = (e) => {
    setSoftConstraints({ ...softConstraints, [e.target.name]: e.target.value });
  };

  const handleAlgoChange = (e) => {
    setAlgoTuning({ ...algoTuning, [e.target.name]: e.target.value });
  };

const handleSave = () => {
    const payload = {
      hard_constraints: hardConstraints,
      soft_constraints: softConstraints,
      algorithm_tuning: algoTuning,
    };
    
    // SAVE THE CONFIGURATION GLOBALLY
    localStorage.setItem("timetable_constraints", JSON.stringify(payload));
    
    console.log("Saving Configuration locally:", payload);
    alert("Constraint configurations saved successfully! You can now run the generation engine.");
  };

  return (
    <ConstraintsWrap>
      <div className="screen-header">
        <p>Define the fitness parameters and hard rules for the timetable generation engine.</p>
      </div>

      <div className="constraints-grid">
        {/* BLOCK 1: Hard Constraints */}
        <div className="constraint-card">
          <h3 className="card-title">Hard Constraints (Non-Negotiable)</h3>
          
          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Student Level Clash</p>
              <p className="setting-desc">Prevent students in the same level from having overlapping exams.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={hardConstraints.studentClash} onChange={() => handleHardToggle('studentClash')} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Strict Room Capacity</p>
              <p className="setting-desc">Do not schedule exams in halls where student count exceeds capacity.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={hardConstraints.roomCapacity} onChange={() => handleHardToggle('roomCapacity')} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Chief Examiner Clash</p>
              <p className="setting-desc">Ensure a lecturer is not scheduled in two different halls simultaneously.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={hardConstraints.chiefExaminerClash} onChange={() => handleHardToggle('chiefExaminerClash')} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* BLOCK 2: Soft Constraints */}
        <div className="constraint-card">
          <h3 className="card-title">Soft Constraints (Penalty Weights)</h3>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Exam Spread Penalty</p>
              <p className="setting-desc">Penalty score for consecutive morning and afternoon exams (1-10).</p>
            </div>
            <input type="number" className="setting-input" name="examSpread" value={softConstraints.examSpread} onChange={handleSoftChange} min="1" max="10" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Daily Exam Limit</p>
              <p className="setting-desc">Maximum exams a single level should write per day.</p>
            </div>
            <input type="number" className="setting-input" name="dailyLimit" value={softConstraints.dailyLimit} onChange={handleSoftChange} min="1" max="3" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Room Under-utilization</p>
              <p className="setting-desc">Penalty for using a large hall for a small exam (1-10).</p>
            </div>
            <input type="number" className="setting-input" name="roomUtilization" value={softConstraints.roomUtilization} onChange={handleSoftChange} min="1" max="10" />
          </div>
        </div>

        {/* BLOCK 3: Algorithm Tuning */}
        <div className="constraint-card full-width">
          <h3 className="card-title">Algorithm Tuning</h3>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Primary Optimization Engine</p>
              <p className="setting-desc">Select the algorithm to process the timetable generation.</p>
            </div>
            <select className="setting-select" name="engine" value={algoTuning.engine} onChange={handleAlgoChange}>
              <option value="Genetic Algorithm">Genetic Algorithm (GA)</option>
              <option value="Simulated Annealing">Simulated Annealing (SA)</option>
              <option value="Hybrid (GA + SA)">Hybrid (GA + SA)</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Max Generations / Iterations</p>
              <p className="setting-desc">The maximum number of loops the engine will run before stopping.</p>
            </div>
            <input type="number" className="setting-input" name="generations" value={algoTuning.generations} onChange={handleAlgoChange} step="100" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <p className="setting-name">Mutation Rate</p>
              <p className="setting-desc">Probability of random schedule changes during generation to prevent local minimums.</p>
            </div>
            <select className="setting-select" name="mutationRate" value={algoTuning.mutationRate} onChange={handleAlgoChange}>
              <option value="Low">Low (Conservative)</option>
              <option value="Medium">Medium (Balanced)</option>
              <option value="High">High (Aggressive)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="action-area">
        <button type="button" className="save-btn" onClick={handleSave}>
          <MdSave size={24} />
          Save Configurations
        </button>
      </div>
    </ConstraintsWrap>
  );
};

export default ConstraintsScreen;