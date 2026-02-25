-- Create admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create run_configs table
CREATE TABLE run_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    algorithm VARCHAR(10) NOT NULL,
    parameters JSONB NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- Create timetable_runs table
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

-- Create courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(100),
    num_students INT NOT NULL,
    duration_minutes INT NOT NULL,
    dept_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timeslots table
CREATE TABLE timeslots (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assignments table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    run_id INT NOT NULL,
    course_id INT NOT NULL,
    timeslot_id INT NOT NULL,
    room_id INT NOT NULL,
    penalty_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES timetable_runs(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (timeslot_id) REFERENCES timeslots(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create algorithm_metrics table
CREATE TABLE algorithm_metrics (
    id SERIAL PRIMARY KEY,
    run_id INT NOT NULL,
    iteration INT NOT NULL,
    best_fitness FLOAT NOT NULL,
    avg_fitness FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);