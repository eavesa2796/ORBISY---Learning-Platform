from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.config import settings
from app.crud import progress_summary_by_track
from app.database import Base, SessionLocal, engine, get_db
from app.models import Track
from app.schemas import ProgressSummaryOut, TrackOut
from app.seed import seed_data

app = FastAPI(title="Learning Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/tracks", response_model=list[TrackOut])
def get_tracks(db: Session = Depends(get_db)) -> list[Track]:
    statement = select(Track).options(selectinload(Track.lessons)).order_by(Track.title)
    return list(db.scalars(statement).unique())


@app.get("/progress/summary", response_model=list[ProgressSummaryOut])
def get_progress_summary(db: Session = Depends(get_db)) -> list[dict[str, int | str]]:
    return progress_summary_by_track(db)
