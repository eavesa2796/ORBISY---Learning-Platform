from pydantic import BaseModel


class LessonOut(BaseModel):
    id: int
    title: str
    difficulty: str
    estimated_minutes: int

    model_config = {"from_attributes": True}


class TrackOut(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    lessons: list[LessonOut]

    model_config = {"from_attributes": True}


class ProgressSummaryOut(BaseModel):
    track: str
    completed_lessons: int
    total_lessons: int
