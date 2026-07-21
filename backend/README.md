# Backend API

FastAPI backend for the personal learning platform.

## Run locally (without Docker)

1. Create and activate a virtual environment.
2. Install packages:
   pip install -r requirements.txt
3. Copy .env.example to .env and adjust values.
4. Run:
   uvicorn app.main:app --reload --port 8000

## Alembic

Create a migration:

alembic revision --autogenerate -m "describe change"

Apply migrations:

alembic upgrade head
