from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SetLogSchema(BaseModel):
    weight: float
    reps: Optional[int] = None
    completed: bool = True

class ExerciseLogSchema(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: List[SetLogSchema]

class WorkoutLogCreateRequest(BaseModel):
    workout_id: Optional[str] = None
    workout_name: str
    exercises: List[ExerciseLogSchema]
    date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class WorkoutLogResponse(BaseModel):
    id: str
    user_id: str
    workout_name: str
    exercises: List[ExerciseLogSchema]
    date: str
    total_volume: float = 0
