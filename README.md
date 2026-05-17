# Automated Examination Timetabling System 📅

A full-stack hybrid meta-heuristic scheduling system designed to optimize clash-free examination timetables. Built as a final year Software Engineering project, this system leverages advanced optimization algorithms to solve complex university scheduling constraints.

## 🚀 Overview

Creating a university examination timetable is a highly constrained combinatorial optimization problem. This project automates that process by utilizing a **Hybrid Genetic Algorithm (GA) and Simulated Annealing (SA)** approach. 

The system processes massive datasets (courses, student capacities, and available venues) and intelligently distributes them across defined exam periods, ensuring zero hard-constraint violations (e.g., a student or examiner scheduled for two exams simultaneously, or venue capacity exceeded) while minimizing soft-constraint penalties (e.g., adequate spacing between exams).

## ✨ Key Features

- **Algorithmic Engine:** Run schedules using standalone Genetic Algorithm, standalone Simulated Annealing, or the optimized Hybrid GA-SA model.
- **Dynamic Course Splitting:** Automatically detects massive student cohorts and safely distributes them across multiple available venues without breaking date/time constraints.
- **Entity Management:** Full CRUD operations for Courses, Rooms, and Timeslots.
- **Real-Time Constraint Tuning:** Toggle hard constraints (Capacity, Student Clashes, Examiner Clashes) and soft constraints via the UI before generating a schedule.
- **Academic Export:** Export generated timetables directly to CSV or fully formatted PDF (complete with university academic headers).
- **System Dashboard:** Monitor algorithm execution metrics, fitness scores, constraint penalties, and system logs in real-time.

## 🛠 Tech Stack

**Frontend:**
- React.js (Vite)
- Styled Components
- jsPDF & jspdf-autotable (for academic document generation)

**Backend:**
- Node.js & Express.js
- TypeScript
- PostgreSQL (pgAdmin)

**Algorithms:**
- Genetic Algorithm (Elitism, Tournament Selection, Mutation)
- Simulated Annealing (Cooling schedules, local search refinement)

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL installed and running (pgAdmin recommended)

### 1. Database Setup
1. Open pgAdmin and create a new database named `timetabling_db` (or your preferred name).
2. Locate the `backend/src/db/migrations/001_create_tables.sql` file and execute it in the pgAdmin Query Tool to build the schema.
3. Locate the `backend/src/db/seed.sql` file and execute it to populate the system with the default administrator account and sample university data.

### 2. Backend Setup
Navigate to the backend directory, install dependencies, compile the TypeScript code, and start the server:

```bash
cd backend
npm install
npm run build
npm start
