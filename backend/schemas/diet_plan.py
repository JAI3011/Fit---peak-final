from pydantic import BaseModel, Field
from typing import Optional


class FoodItemSchema(BaseModel):
    name: str
    quantity: str
    calories: int = Field(0, ge=0)
    protein: int = Field(0, ge=0)


class MealSchema(BaseModel):
    id: Optional[str] = None
    name: str
    time: Optional[str] = None
    items: list[FoodItemSchema] = []
    calories: int = 0
    protein: int = 0


class DietPlanCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    daily_calories: int = Field(..., ge=500, le=10000)
    daily_protein: int = Field(..., ge=0, le=500)
    duration: Optional[str] = "Flexible"
    meals: list[MealSchema] = Field(..., min_length=1)


class DietPlanResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    daily_calories: int
    daily_protein: int
    duration: Optional[str] = None
    meals: list[dict] = []
    trainer_id: str
    created_at: str
