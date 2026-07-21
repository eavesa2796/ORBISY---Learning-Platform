from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Lesson, Track, User, UserLessonProgress


def seed_data(db: Session) -> None:
    existing = db.scalar(select(func.count(Track.id)))
    if existing and existing > 0:
        return

    tracks = [
        Track(
            slug="react",
            title="React",
            description="Build modern interactive interfaces with confidence.",
            lessons=[
                Lesson(title="React Fundamentals", difficulty="beginner", estimated_minutes=45),
                Lesson(title="Component Composition", difficulty="beginner", estimated_minutes=40),
                Lesson(title="Data Fetching Patterns", difficulty="intermediate", estimated_minutes=50),
            ],
        ),
        Track(
            slug="python",
            title="Python",
            description="Design maintainable backend services and business logic.",
            lessons=[
                Lesson(title="FastAPI Basics", difficulty="beginner", estimated_minutes=40),
                Lesson(title="Dependency Injection", difficulty="intermediate", estimated_minutes=55),
                Lesson(title="Pytest for APIs", difficulty="intermediate", estimated_minutes=60),
            ],
        ),
        Track(
            slug="sql",
            title="SQL",
            description="Model reliable data and write clear analytical queries.",
            lessons=[
                Lesson(title="Schema Design", difficulty="beginner", estimated_minutes=40),
                Lesson(title="Joins and Grouping", difficulty="intermediate", estimated_minutes=55),
                Lesson(title="Indexes and Explain", difficulty="advanced", estimated_minutes=70),
            ],
        ),
    ]

    db.add_all(tracks)
    db.flush()

    user = User(email="you@example.com", name="Learning Builder")
    db.add(user)
    db.flush()

    for track in tracks:
        for lesson in track.lessons:
            status = "completed" if lesson.title in {"React Fundamentals", "FastAPI Basics"} else "todo"
            db.add(
                UserLessonProgress(
                    user_id=user.id,
                    lesson_id=lesson.id,
                    status=status,
                    notes="Auto-seeded starter progress",
                )
            )

    db.commit()
