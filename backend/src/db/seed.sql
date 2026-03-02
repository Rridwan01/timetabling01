-- Clear existing data to prevent duplicate errors during testing
TRUNCATE TABLE assignments, algorithm_metrics, timetable_runs, run_configs, courses, rooms, timeslots, admins RESTART IDENTITY CASCADE;

-- 1. Insert System Admin
INSERT INTO admins (username, password_hash) VALUES ('admin', 'hashed_password_placeholder');

-- 2. Insert Examination Halls & Rooms
-- Notice 'Lab 1' is under Maintenance to test if the algorithm successfully avoids it!
INSERT INTO rooms (name, capacity, availability) VALUES
('Hall A', 250, 'Available'),
('Hall B', 150, 'Available'),
('LT 1', 500, 'Available'),
('LT 2', 300, 'Available'),
('Lab 1', 50, 'Maintenance');

-- 3. Insert Courses (Lead City Computing Dept Context)
INSERT INTO courses (code, title, level, num_students, lecturer) VALUES
('SEN 401', 'Software Engineering Project', '400L', 45, 'Dr. A.A. Waheed'),
('SEN 412', 'Computing Fundamentals', '400L', 120, 'Dr. V.B. Oyekunle'),
('SEN 405', 'Artificial Intelligence', '400L', 80, 'Dr. A.A. Waheed'),
('SEN 301', 'Data Structures', '300L', 150, 'Dr. S.A. Smith'),
('SEN 305', 'Operating Systems', '300L', 145, 'Prof. O.O. Ojo'),
('SEN 205', 'Introduction to Cybersecurity', '200L', 200, 'Prof. O.O. Ojo'),
('CSC 201', 'Computer Programming I', '200L', 250, 'Dr. V.B. Oyekunle');

-- 4. Insert Timeslots (e.g., First 3 days of an Exam Week)
-- All exams are assumed to be 2 hours as discussed!
INSERT INTO timeslots (label, start_time, end_time, date) VALUES
('Morning', '2026-10-12 09:00:00', '2026-10-12 11:00:00', '2026-10-12'),
('Afternoon', '2026-10-12 13:00:00', '2026-10-12 15:00:00', '2026-10-12'),
('Morning', '2026-10-13 09:00:00', '2026-10-13 11:00:00', '2026-10-13'),
('Afternoon', '2026-10-13 13:00:00', '2026-10-13 15:00:00', '2026-10-13'),
('Morning', '2026-10-14 09:00:00', '2026-10-14 11:00:00', '2026-10-14'),
('Afternoon', '2026-10-14 13:00:00', '2026-10-14 15:00:00', '2026-10-14');