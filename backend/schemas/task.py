from typing import Literal

from pydantic import BaseModel, Field


class TrainerTaskItem(BaseModel):
    text: str = Field(..., min_length=1, max_length=160)
    category: Literal["workout", "nutrition", "recovery", "tracking", "custom"] = "custom"
    priority: Literal["low", "medium", "high"] = "medium"


class TrainerAssignTasksRequest(BaseModel):
    client_id: str = Field(..., min_length=1)
    date: str | None = Field(default=None, min_length=10, max_length=10)
    tasks: list[TrainerTaskItem] = Field(..., min_length=1, max_length=10)


class TrainerClearTasksRequest(BaseModel):
    client_id: str = Field(..., min_length=1)
    date: str | None = Field(default=None, min_length=10, max_length=10)
