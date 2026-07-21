from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import Lesson, Track, UserLessonProgress


def list_tracks(db: Session) -> list[Track]:
    statement = select(Track).order_by(Track.title)
    return list(db.scalars(statement).unique())


def progress_summary_by_track(db: Session) -> list[dict[str, int | str]]:
    completed_case = case((UserLessonProgress.status == "completed", 1), else_=0)

    statement = (
        select(
            Track.title,
            func.coalesce(func.sum(completed_case), 0).label("completed_lessons"),
            func.count(Lesson.id).label("total_lessons"),
        )
        .join(Lesson, Lesson.track_id == Track.id)
        .join(UserLessonProgress, UserLessonProgress.lesson_id == Lesson.id, isouter=True)
        .group_by(Track.title)
        .order_by(Track.title)
    )

    rows = db.execute(statement).all()
    return [
        {
            "track": row.title,
            "completed_lessons": int(row.completed_lessons or 0),
            "total_lessons": int(row.total_lessons or 0),
        }
        for row in rows
    ]
