# Anthony Build Log - Full-Stack Learning Platform

Personal learning platform designed to practice React, Python, and SQL in one real project.

## Tech Stack

- Frontend: Next.js + React + TypeScript
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Migrations: Alembic
- Local Orchestration: Docker Compose

## Project Structure

- app/: Next.js routes and pages
- components/: shared React UI components
- backend/app/: FastAPI app, models, schemas, and CRUD
- backend/alembic/: database migrations
- db/init/: optional SQL seed files

## Local Setup

1. Install Node dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env.local
```

3. Run full stack:

```bash
docker compose up --build
```

4. Open apps:

- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/health

## Frontend Only

```bash
npm run dev
```

Set NEXT_PUBLIC_API_BASE_URL in .env.local if backend runs elsewhere.

## Backend Only

Inside backend/:

```bash
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Learning Path In This Project

- React: dashboard and lesson UIs
- Python: FastAPI route design and service logic
- SQL: schema design, migrations, and progress queries
