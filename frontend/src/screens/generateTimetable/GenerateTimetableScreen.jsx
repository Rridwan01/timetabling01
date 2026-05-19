import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GenerateWrap } from "./GenerateTimetableScreen.styles";
import { MdSettings, MdPlayArrow, MdStop, MdCheckCircle } from "react-icons/md";

const GenerateTimetableScreen = () => {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState("GA");

  // Simulation & State
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    iteration: 0,
    fitness: 0,
    clashes: 0,
  });
  const [logs, setLogs] = useState([
    { type: "info", text: "System Ready. Awaiting engine start..." },
  ]);

  // Terminal Auto-Scroll Ref
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // VISUAL LOG SIMULATION (Keeps UI looking active while waiting for Redis/BullMQ)
  useEffect(() => {
    let interval;
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setMetrics((prev) => ({
          ...prev,
          iteration: prev.iteration + Math.floor(Math.random() * 50),
          clashes: Math.max(0, prev.clashes - Math.floor(Math.random() * 3)),
        }));

        const newLog = generateMockLog(algorithm);
        setLogs((prev) => [...prev, newLog]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCompleted, algorithm]);

  const generateMockLog = (algo) => {
    const time = new Date().toLocaleTimeString();
    const gaPhrases = [
      "Applying Crossover to Population...",
      "Evaluating Fitness Function...",
      "Mutation Triggered on Chromosome...",
      "Selecting Elites...",
    ];
    const saPhrases = [
      "Cooling Temperature...",
      "Accepting Sub-optimal State to escape local minimum...",
      "Perturbing Schedule...",
      "Calculating Energy Difference...",
    ];

    const phrases = algo === "GA" || algo === "HYBRID" ? gaPhrases : saPhrases;
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    return { type: "info", time, text };
  };

  const handleStart = async () => {
    localStorage.removeItem("generated_timetable");
    localStorage.removeItem("timetable_timeslots");

    let engineName = "Genetic Algorithm";
    if (algorithm === "SA") engineName = "Simulated Annealing";
    if (algorithm === "HYBRID") engineName = "Hybrid GA-SA";

    setLogs([
      {
        type: "info",
        time: new Date().toLocaleTimeString(),
        text: `Initializing ${engineName} Engine...`,
      },
    ]);

    setProgress(0);
    setMetrics({ iteration: 0, fitness: 0, clashes: 156 });
    setIsCompleted(false);
    setIsRunning(true);

    try {
      const savedConfigString = localStorage.getItem("timetable_constraints");
      let payload;

      if (savedConfigString) {
        payload = JSON.parse(savedConfigString);
        payload.algorithm_tuning.engine = engineName;
      } else {
        payload = {
          hard_constraints: {
            studentClash: true,
            roomCapacity: true,
            chiefExaminerClash: true,
          },
          soft_constraints: {
            examSpread: 5,
            dailyLimit: 2,
            roomUtilization: 3,
          },
          algorithm_tuning: {
            engine: engineName,
            generations: 1000,
            mutationRate: "Medium",
          },
        };
      }

      const token = localStorage.getItem("token");

      // 1. START THE BACKGROUND JOB
      const response = await fetch(
        "http://localhost:3000/api/timetable/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start generation.");
      }

      const jobId = data.jobId;
      setLogs((prev) => [
        ...prev,
        {
          type: "info",
          time: new Date().toLocaleTimeString(),
          text: `Background Worker Job assigned (ID: ${jobId}). Polling queue...`,
        },
      ]);

      // 2. POLL THE BULLMQ STATUS ENDPOINT
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `http://localhost:3000/api/timetable/status/${jobId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const statusData = await statusRes.json();

          if (!statusRes.ok)
            throw new Error(statusData.error || "Status check failed");

          // Update real progress from the background worker
          setProgress(statusData.progress || 0);

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            setIsRunning(false);
            setIsCompleted(true);
            setProgress(100);

            const result = statusData.result; // Real payload from BullMQ
            const finalFitnessScore = isNaN(Number(result.fitness))
              ? 0
              : Number(result.fitness);

            setMetrics({
              iteration: payload.algorithm_tuning.generations,
              fitness: finalFitnessScore,
              // A simple heuristic: every 5% drop in fitness roughly correlates to 1 unoptimized constraint
              clashes:
                finalFitnessScore === 100
                  ? 0
                  : Math.floor((100 - finalFitnessScore) / 5),
            });

            setLogs((prev) => [
              ...prev,
              {
                type: "info",
                time: new Date().toLocaleTimeString(),
                text: `Worker completed in ${result.timeTakenMs}ms`,
              },
              {
                type: "success",
                time: new Date().toLocaleTimeString(),
                text: "Optimal Timetable Generated Successfully!",
              },
            ]);

            // Save actual completed data to LocalStorage
            localStorage.setItem(
              "generated_timetable",
              JSON.stringify(result.timetable),
            );
            localStorage.setItem(
              "timetable_timeslots",
              JSON.stringify(result.timeslots),
            );
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setIsRunning(false);
            setLogs((prev) => [
              ...prev,
              {
                type: "error",
                time: new Date().toLocaleTimeString(),
                text: `Worker Failed: ${statusData.error}`,
              },
            ]);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setIsRunning(false);
          setLogs((prev) => [
            ...prev,
            {
              type: "error",
              time: new Date().toLocaleTimeString(),
              text: `Polling Error: ${pollErr.message}`,
            },
          ]);
        }
      }, 1000); // Check status every 1 second
    } catch (error) {
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          time: new Date().toLocaleTimeString(),
          text: `Server Error: ${error.message}`,
        },
      ]);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setLogs((prev) => [
      ...prev,
      {
        type: "warning",
        time: new Date().toLocaleTimeString(),
        text: "Process Tracking Terminated (Note: Job may still be running on server).",
      },
    ]);
  };

  return (
    <GenerateWrap>
      <div className="screen-header">
        <h1>Timetable Engine</h1>
        <p>Configure parameters and execute the optimization algorithm.</p>
      </div>

      <div className="engine-grid">
        <div className="config-panel">
          <h3 className="panel-title">
            <MdSettings /> Algorithm Setup
          </h3>

          <div className="form-group">
            <label>Select Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isRunning}
            >
              <option value="GA">Genetic Algorithm (GA)</option>
              <option value="SA">Simulated Annealing (SA)</option>
              <option value="HYBRID">Hybrid Model (GA + SA)</option>
            </select>
          </div>

          {(algorithm === "GA" || algorithm === "HYBRID") && (
            <>
              <div className="form-group">
                <label>Population Size</label>
                <input type="number" defaultValue="500" disabled={isRunning} />
              </div>
              <div className="form-group">
                <label>Mutation Rate (%)</label>
                <input type="number" defaultValue="5" disabled={isRunning} />
              </div>
            </>
          )}

          {algorithm === "SA" && (
            <>
              <div className="form-group">
                <label>Initial Temperature</label>
                <input type="number" defaultValue="1000" disabled={isRunning} />
              </div>
              <div className="form-group">
                <label>Cooling Rate</label>
                <input
                  type="number"
                  defaultValue="0.95"
                  step="0.01"
                  disabled={isRunning}
                />
              </div>
            </>
          )}

          {!isRunning && !isCompleted && (
            <button className="run-btn" onClick={handleStart}>
              <MdPlayArrow size={24} /> Run Generation
            </button>
          )}

          {isRunning && (
            <button className="run-btn running" onClick={handleStop}>
              <MdStop size={24} /> Stop Execution
            </button>
          )}

          {isCompleted && (
            <button
              className="run-btn completed"
              onClick={() => navigate("/timetable-view")}
            >
              <MdCheckCircle size={24} /> View Timetable
            </button>
          )}
        </div>

        <div className="execution-panel">
          <div className="metrics-grid">
            <div className="metric-card">
              <p className="metric-lbl">Iterations / Gen</p>
              <p className="metric-val">{metrics.iteration}</p>
            </div>
            <div className="metric-card">
              <p className="metric-lbl">Fitness Score</p>
              <p className="metric-val highlight">
                {Number(metrics.fitness).toFixed(1)}%
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-lbl">Hard Clashes</p>
              <p
                className="metric-val"
                style={{ color: metrics.clashes > 0 ? "#ee5d50" : "#01b574" }}
              >
                {metrics.clashes}
              </p>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Worker Progress</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="terminal-window scrollbar" ref={terminalRef}>
            {logs.map((log, index) => (
              <div key={index} className={`log-line ${log.type}`}>
                {log.time && <span className="timestamp">[{log.time}]</span>}
                <span className="log-text">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GenerateWrap>
  );
};

export default GenerateTimetableScreen;
