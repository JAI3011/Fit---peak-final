from pydantic import BaseModel, Field
from typing import Optional


class ExerciseSchema(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = None
    equipment: Optional[str] = None
    sets: int = Field(..., ge=1)
    reps: int = Field(..., ge=1)
    rest: int = Field(60, ge=0)  # seconds


class WorkoutCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    day: Optional[str] = None
    exercises: list[ExerciseSchema] = Field(..., min_length=1)
    duration: Optional[str] = "45-60 min"
    intensity: Optional[str] = "Medium"


class WorkoutResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    day: Optional[str] = None
    exercises: list[dict] = []
    duration: Optional[str] = None
    intensity: Optional[str] = None
    trainer_id: str
    created_at: str
