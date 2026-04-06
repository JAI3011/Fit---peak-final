from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, time

class SessionCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    date: date                      # ISO date YYYY-MM-DD
    time: str = Field(..., pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')  # HH:MM
    type: Literal["workout", "diet", "check"] = "workout"

class SessionResponse(BaseModel):
    id: str
    title: str
    date: str          # ISO string
    time: str
    type: str
    trainer_id: str
    created_at: str