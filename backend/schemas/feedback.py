from pydantic import BaseModel, Field
from typing import Literal, Optional


class FeedbackCreateRequest(BaseModel):
    rating: int = Field(0, ge=0, le=5)
    type: Literal[
        "Bug Report", "Feature Request", "General Feedback", "Trainer Feedback"
    ] = "General Feedback"
    comment: str = Field(..., min_length=1, max_length=2000)


class FeedbackResponse(BaseModel):
    id: str
    rating: int
    type: str
    comment: str
    user_name: str
    user_email: str
    date: str
