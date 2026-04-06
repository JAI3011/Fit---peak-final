from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MealLogSchema(BaseModel):
    name: str  # Breakfast, Lunch, etc.
    eaten: bool = True
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fats: float = 0
    photo_uploaded: bool = False
    items: List[str] = []

class DietLogCreateRequest(BaseModel):
    meals: List[MealLogSchema]
    date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class DailyStatsResponse(BaseModel):
    date: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
