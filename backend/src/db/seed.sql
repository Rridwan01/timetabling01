-- Clear existing data to prevent duplicate errors during testing
TRUNCATE TABLE assignments, algorithm_metrics, timetable_runs, run_configs, courses, rooms, timeslots, admins RESTART IDENTITY CASCADE;

-- 1. Insert System Admin (DO NOT REMOVE THIS OR YOU CANT LOG IN)
INSERT INTO admins (username, password_hash) VALUES ('admin', 'hashed_password_placeholder');

-- 2. Expand Rooms (8 Halls from massive to small)
INSERT INTO rooms (name, capacity, availability) VALUES
('University Grand Auditorium', 1200, 'Available'),
('LT 1', 500, 'Available'),
('LT 2', 300, 'Available'),
('Faculty of Science Hall', 250, 'Available'),
('Hall A', 150, 'Available'),
('Hall B', 100, 'Available'),
('SE Lab 1', 60, 'Available'),
('SE Lab 2', 60, 'Maintenance'); -- Throwing a curveball constraint

-- 3. Expand Timeslots to a 2-Week Exam Period (10 Days, Morning/Afternoon)
INSERT INTO timeslots (label, start_time, end_time, date) VALUES
('Morning', '2026-05-18 09:00:00', '2026-05-18 12:00:00', '2026-05-18'),
('Afternoon', '2026-05-18 14:00:00', '2026-05-18 17:00:00', '2026-05-18'),
('Morning', '2026-05-19 09:00:00', '2026-05-19 12:00:00', '2026-05-19'),
('Afternoon', '2026-05-19 14:00:00', '2026-05-19 17:00:00', '2026-05-19'),
('Morning', '2026-05-20 09:00:00', '2026-05-20 12:00:00', '2026-05-20'),
('Afternoon', '2026-05-20 14:00:00', '2026-05-20 17:00:00', '2026-05-20'),
('Morning', '2026-05-21 09:00:00', '2026-05-21 12:00:00', '2026-05-21'),
('Afternoon', '2026-05-21 14:00:00', '2026-05-21 17:00:00', '2026-05-21'),
('Morning', '2026-05-22 09:00:00', '2026-05-22 12:00:00', '2026-05-22'),
('Afternoon', '2026-05-22 14:00:00', '2026-05-22 17:00:00', '2026-05-22'),
('Morning', '2026-05-25 09:00:00', '2026-05-25 12:00:00', '2026-05-25'),
('Afternoon', '2026-05-25 14:00:00', '2026-05-25 17:00:00', '2026-05-25'),
('Morning', '2026-05-26 09:00:00', '2026-05-26 12:00:00', '2026-05-26'),
('Afternoon', '2026-05-26 14:00:00', '2026-05-26 17:00:00', '2026-05-26'),
('Morning', '2026-05-27 09:00:00', '2026-05-27 12:00:00', '2026-05-27'),
('Afternoon', '2026-05-27 14:00:00', '2026-05-27 17:00:00', '2026-05-27'),
('Morning', '2026-05-28 09:00:00', '2026-05-28 12:00:00', '2026-05-28'),
('Afternoon', '2026-05-28 14:00:00', '2026-05-28 17:00:00', '2026-05-28'),
('Morning', '2026-05-29 09:00:00', '2026-05-29 12:00:00', '2026-05-29'),
('Afternoon', '2026-05-29 14:00:00', '2026-05-29 17:00:00', '2026-05-29');

-- 4. The 45-Course "Shitload" (Mix of core SE, CS, GST, and Math)
INSERT INTO courses (code, title, level, num_students, lecturer) VALUES
-- 400 LEVEL (Final Year Core & Electives)
('SEN 401', 'Software Engineering Project I', '400L', 45, 'Dr. A.A. Waheed'),
('SEN 403', 'Software Architecture & Design', '400L', 52, 'Dr. V.B. Oyekunle'),
('SEN 405', 'Software Testing & Quality Assurance', '400L', 48, 'Mr. S.A. Adeyemi'),
('SEN 407', 'Human-Computer Interaction', '400L', 55, 'Mrs. T.K. Fasina'),
('SEN 409', 'Project Management for Software Engineers', '400L', 60, 'Dr. O.B. Balogun'),
('SEN 411', 'Formal Methods in Software Eng', '400L', 42, 'Dr. V.B. Oyekunle'),
('SEN 413', 'Artificial Intelligence', '400L', 65, 'Dr. A.A. Waheed'),
('SEN 415', 'Machine Learning Fundamentals', '400L', 50, 'Prof. O.O. Ojo'),
('SEN 417', 'Cloud Computing & Virtualization', '400L', 55, 'Dr. E.O. Omidiora'),
('SEN 419', 'Blockchain Technologies', '400L', 38, 'Mr. S.A. Adeyemi'),
('SEN 421', 'Advanced Cybersecurity', '400L', 40, 'Dr. A.A. Waheed'),

-- 300 LEVEL (Heavy core load)
('SEN 301', 'Object-Oriented Programming (Java)', '300L', 145, 'Prof. O.O. Ojo'),
('SEN 303', 'Database Management Systems', '300L', 155, 'Dr. V.B. Oyekunle'),
('SEN 305', 'Web Application Development', '300L', 160, 'Mr. S.A. Adeyemi'),
('SEN 307', 'Operating Systems', '300L', 150, 'Dr. O.B. Balogun'),
('SEN 309', 'Computer Networks & Comm.', '300L', 148, 'Mrs. T.K. Fasina'),
('SEN 311', 'Systems Analysis & Design', '300L', 140, 'Dr. V.B. Oyekunle'),
('SEN 313', 'Algorithm Design & Analysis', '300L', 135, 'Prof. A.S. Sodiya'),
('SEN 315', 'Software Requirement Engineering', '300L', 142, 'Dr. A.A. Waheed'),
('SEN 317', 'Mobile App Development (Android)', '300L', 120, 'Mr. S.A. Adeyemi'),
('CSC 301', 'Compiler Construction', '300L', 115, 'Prof. O.O. Ojo'),
('GST 301', 'Entrepreneurship Studies', '300L', 850, 'Dr. C.C. Nwosu'),
('GST 303', 'Logic & Philosophy', '300L', 800, 'Rev. Dr. A.O. Makinde'),

-- 200 LEVEL (Direct entry + large general classes)
('SEN 201', 'Introduction to Software Engineering', '200L', 210, 'Dr. A.A. Waheed'),
('SEN 203', 'Programming in C/C++', '200L', 230, 'Prof. O.O. Ojo'),
('SEN 205', 'Data Structures', '200L', 215, 'Mr. S.A. Adeyemi'),
('SEN 207', 'Discrete Mathematics', '200L', 250, 'Dr. E.O. Omidiora'),
('SEN 209', 'Digital Logic Design', '200L', 205, 'Mrs. T.K. Fasina'),
('SEN 211', 'Computer Architecture', '200L', 200, 'Dr. O.B. Balogun'),
('CSC 201', 'Computer Programming I', '200L', 350, 'Mr. S.A. Adeyemi'),
('CSC 203', 'Intro to Information Systems', '200L', 320, 'Dr. V.B. Oyekunle'),
('MAT 201', 'Mathematical Methods I', '200L', 400, 'Dr. K.A. Olaniyi'),
('MAT 203', 'Linear Algebra', '200L', 380, 'Dr. K.A. Olaniyi'),
('PHY 201', 'General Physics III', '200L', 450, 'Prof. B.A. Alabi'),
('PHY 203', 'Physics Lab II', '200L', 450, 'Prof. B.A. Alabi'),
('GST 201', 'Communication in English II', '200L', 1100, 'Dr. F.M. Adebayo'),
('GST 203', 'Nigerian Peoples & Culture', '200L', 1150, 'Dr. F.M. Adebayo'),
('ENT 201', 'Vocational Skills', '200L', 1050, 'Dr. C.C. Nwosu'),
('STA 201', 'Statistics for Physical Sciences', '200L', 310, 'Dr. K.A. Olaniyi');