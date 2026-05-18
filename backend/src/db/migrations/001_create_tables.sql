-- Drop old redundant tables if they exist
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS timetable_runs CASCADE;
DROP TABLE IF EXISTS run_configs CASCADE;
DROP TABLE IF EXISTS student_course_registrations CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS timeslots CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 1. Unified Users Table (Replaces redundant admins/users tables)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Configuration & Runs
CREATE TABLE run_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    algorithm VARCHAR(50) NOT NULL, 
    parameters JSONB NOT NULL,     
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timetable_runs (
    id SERIAL PRIMARY KEY,
    run_config_id INT REFERENCES run_configs(id),
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    summary JSONB
);

-- 3. Core Entities
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,       
    title VARCHAR(100) NOT NULL,            
    level VARCHAR(10) NOT NULL,             
    num_students INT NOT NULL,              
    lecturer VARCHAR(100) NOT NULL,         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,       
    capacity INT NOT NULL,                  
    availability VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timeslots (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,             
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- NEW: Real Student Tracking
-- ==========================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    matric_no VARCHAR(20) UNIQUE NOT NULL,
    level VARCHAR(10) NOT NULL
);

CREATE TABLE student_course_registrations (
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, course_id)
);

-- 4. Output
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    run_id INT REFERENCES timetable_runs(id),
    course_id INT REFERENCES courses(id),
    timeslot_id INT REFERENCES timeslots(id),
    room_id INT REFERENCES rooms(id)
);