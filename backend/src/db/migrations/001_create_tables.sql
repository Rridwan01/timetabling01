-- Create admins table (Unchanged)
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create run_configs table (Unchanged - JSONB is perfect for our new UI payload)
CREATE TABLE run_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    algorithm VARCHAR(50) NOT NULL, -- e.g., 'Genetic Algorithm', 'Simulated Annealing'
    parameters JSONB NOT NULL,      -- Will store our exact UI JSON (Hard/Soft Constraints)
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- Create timetable_runs table (Unchanged)
CREATE TABLE timetable_runs (
    id SERIAL PRIMARY KEY,
    run_config_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    summary JSONB,
    seed INT,
    FOREIGN KEY (run_config_id) REFERENCES run_configs(id)
);

-- Create courses table (UPDATED for Exam System)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,       -- e.g., 'SEN 401'
    title VARCHAR(100) NOT NULL,            -- e.g., 'Software Engineering Project'
    level VARCHAR(10) NOT NULL,             -- e.g., '400L' (Crucial for clash prevention)
    num_students INT NOT NULL,              -- e.g., 45
    lecturer VARCHAR(100) NOT NULL,         -- Chief Examiner
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table (UPDATED for Exam System)
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,       -- e.g., 'Hall A'
    capacity INT NOT NULL,                  -- e.g., 250
    availability VARCHAR(20) DEFAULT 'Available', -- 'Available' or 'Maintenance'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timeslots table (Unchanged)
CREATE TABLE timeslots (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,             -- e.g., 'Morning', 'Afternoon'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assignments table (Unchanged)
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    run_id INT NOT NULL,
    course_id INT NOT NULL,
    timeslot_id INT NOT NULL,
    room_id INT NOT NULL,
    penalty_score FLOAT,                    -- To track soft constraint violations per assignment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES timetable_runs(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (timeslot_id) REFERENCES timeslots(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create algorithm_metrics table (Unchanged)
CREATE TABLE algorithm_metrics (
    id SERIAL PRIMARY KEY,
    run_id INT NOT NULL,
    iteration INT NOT NULL,
    best_fitness FLOAT NOT NULL,
    avg_fitness FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);