from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional


# ── Macros sub-schema ─────────────────────────────────────────────
class MacrosSchema(BaseModel):
    protein: float = 0
    carbs: float = 0
    fats: float = 0


# ── User update (profile) ─────────────────────────────────────────
class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=120)
    height: Optional[float] = Field(None, ge=50, le=300)
    weight: Optional[float] = Field(None, ge=10, le=500)
    gender: Optional[Literal["male", "female", "other"]] = None
    goal: Optional[str] = None
    calories_goal: Optional[int] = Field(None, ge=500, le=10000)
    calories_consumed: Optional[int] = Field(None, ge=0, le=10000)
    overall_progress: Optional[float] = Field(None, ge=0, le=100)
    macros: Optional[MacrosSchema] = None
    trainer_id: Optional[str] = None
    assigned_workout: Optional[dict] = None
    assigned_diet: Optional[dict] = None
    status: Optional[Literal["active", "inactive", "pending"]] = None
    role: Optional[Literal["user", "trainer", "admin"]] = None


# ── Admin edit user ───────────────────────────────────────────────
class AdminUserEditRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[Literal["user", "trainer", "admin"]] = None
    status: Optional[Literal["active", "inactive", "pending"]] = None
    trainer_id: Optional[str] = None


# ── Public user response ──────────────────────────────────────────
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    joined: str
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    goal: Optional[str] = None
    calories_goal: int = 2400
    calories_consumed: int = 0
    overall_progress: float = 0
    macros: MacrosSchema = MacrosSchema()
    trainer_id: Optional[str] = None
    assigned_workout: Optional[dict] = None
    assigned_diet: Optional[dict] = None
    progress_data: list = []
    client_count: int = 0
    certification: Optional[str] = None
    experience: Optional[str] = None
    specialization: Optional[str] = None
