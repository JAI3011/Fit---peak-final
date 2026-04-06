from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional


class AddTrainerRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    specialization: Optional[str] = None
    experience: Optional[str] = None
    certification: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    status: Literal["active", "pending", "inactive"] = "active"

class AssignPlanRequest(BaseModel):
    """Body sent when a trainer assigns a workout/diet plan to a client."""
    plan_id: str
    client_id: str
