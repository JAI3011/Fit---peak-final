from pydantic import BaseModel, Field
from typing import Optional

class HighlightCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    youtube_url: str = Field(..., description="Full YouTube URL (e.g., https://www.youtube.com/watch?v=... or embed link)")
    category: Optional[str] = Field(None, max_length=50, description="e.g., 'Workout Tips', 'Success Story', 'Trainer Demo'")

class HighlightUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    youtube_url: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)

class HighlightResponse(BaseModel):
    id: str
    title: str
    youtube_url: str
    category: Optional[str] = None
    created_at: str