from pydantic import BaseModel, EmailStr, Field
from typing import Literal


# ── Register ──────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    age: int = Field(..., ge=1, le=120)
    height: float = Field(..., ge=50, le=300)
    weight: float = Field(..., ge=10, le=500)
    gender: Literal["male", "female", "other"] = "male"
    goal: Literal["weight_loss", "muscle_gain", "endurance"] = "weight_loss"
    role: Literal["user", "trainer", "admin"] = "user"


# ── Login ─────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["user", "trainer", "admin"] = "user"


# ── Admin Creation ───────────────────────────────────────────────
class AdminCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


# ── Token response ────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# OTP-based password reset
class RequestOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPAndResetRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)