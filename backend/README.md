# Examination Timetabling System Backend

This is the backend for the Examination Timetabling System, built with Node.js, Express, and TypeScript.

## Features
- Basic authentication
- CRUD operations for courses and rooms
- Timetable service module
- Minimal working Genetic Algorithm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

- Ensure PostgreSQL is running.
- Update the `.env` file with your database credentials.
- Run migrations:

```bash
npm run migrate
```

3. Start the development server:

```bash
npm run dev
```

4. Build the project:

```bash
npm run build
```

5. Run tests:

```bash
npm run test
```

## Environment Variables

- `PORT`: The port on which the server will run (default: 3000).
- `DATABASE_URL`: The connection string for the PostgreSQL database.

## Project Structure

- `src/`: Source code for the backend.
- `dist/`: Compiled JavaScript files.
- `.env`: Environment variables.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.

## License

This project is licensed under the MIT License.