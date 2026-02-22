-- Seed data for admins
INSERT INTO admins (username, password_hash) VALUES
('admin', 'hashed_password');

-- Seed data for courses
INSERT INTO courses (code, title, num_students, duration_minutes) VALUES
('CS101', 'Introduction to Computer Science', 100, 120),
('MATH201', 'Calculus II', 80, 90),
('PHYS301', 'Physics III', 60, 120);

-- Seed data for rooms
INSERT INTO rooms (name, capacity) VALUES
('Room A', 50),
('Room B', 100),
('Room C', 200);

-- Seed data for timeslots
INSERT INTO timeslots (label, start_time, end_time) VALUES
('Slot 1', '2026-06-01 09:00:00', '2026-06-01 11:00:00'),
('Slot 2', '2026-06-01 12:00:00', '2026-06-01 14:00:00'),
('Slot 3', '2026-06-01 15:00:00', '2026-06-01 17:00:00');