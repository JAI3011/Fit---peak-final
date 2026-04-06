from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status

from config.database import get_database
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RequestOTPRequest,
    VerifyOTPAndResetRequest,
)
from utils.security import hash_password, verify_password, create_access_token, generate_otp
from utils.helpers import doc_to_dict, utc_now_str, today_date_str
from utils.email_service import send_otp_email


async def register_user(payload: RegisterRequest) -> dict:
    db = get_database()
    normalized_email = payload.email.strip().lower()

    # Check duplicate email
    existing = await db["users"].find_one({"email": normalized_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    doc = {
        "name": payload.name,
        "email": normalized_email,  # normalized
        "password_hash": hash_password(payload.password),
        "role": payload.role,
        "age": payload.age,
        "height": payload.height,
        "weight": payload.weight,
        "gender": payload.gender,
        "goal": payload.goal,
        "status": "active" if payload.role != "trainer" else "pending",
        "joined": today_date_str(),
        "created_at": utc_now_str(),
        # fitness defaults
        "calories_goal": 2400,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": None,
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
        # trainer-specific
        "certification": None,
        "experience": None,
        "specialization": None,
        "client_count": 0,
    }

    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id
    user = doc_to_dict(doc)

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": _safe_user(user)}


async def login_user(payload: LoginRequest) -> dict:
    db = get_database()
    email = payload.email.strip().lower()

    # Debug logging
    print(f"[AUTH] Login Attempt: email='{email}', role='{payload.role}'")

    user_doc = await db["users"].find_one({"email": email})
    if not user_doc:
        print(f"[AUTH ERROR] User not found in DB: '{email}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, user_doc.get("password_hash", "")):
        print(f"[AUTH ERROR] Password mismatch for: '{email}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user_doc.get("role") != payload.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is not registered as '{payload.role}'",
        )

    # ✅ Added clear pending status message
    if user_doc.get("status") == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Trainer account is pending approval by admin.",
        )

    if user_doc.get("status") == "inactive":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact admin.",
        )

    user = doc_to_dict(user_doc)
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": _safe_user(user)}


async def create_admin_account(payload) -> dict:
    """
    Create an admin account.
    - If NO admins exist allow (setup mode for first admin)
    - If admins exist require existing admin authentication (handled by middleware)
    """
    db = get_database()
    normalized_email = payload.email.strip().lower()

    # Check if email already exists
    existing = await db["users"].find_one({"email": normalized_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Security: Check if any admins exist
    admin_count = await db["users"].count_documents({"role": "admin"})
    if admin_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts can only be created by existing admins. Use the admin panel.",
        )

    # Create first admin account
    doc = {
        "name": payload.name,
        "email": normalized_email,  # normalized
        "password_hash": hash_password(payload.password),
        "role": "admin",
        "status": "active",
        "joined": today_date_str(),
        "created_at": utc_now_str(),
        "calories_goal": 2400,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": None,
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
    }

    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id
    user = doc_to_dict(doc)

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": _safe_user(user)}


def _safe_user(user: dict) -> dict:
    """Strip sensitive fields before returning to client."""
    return {k: v for k, v in user.items() if k not in ("password_hash",)}


async def request_otp(payload: RequestOTPRequest) -> dict:
    """
    Generate and send an OTP to the user's email.
    """
    db = get_database()
    email = payload.email.strip().lower()

    user = await db["users"].find_one({"email": email})
    # Security: Do NOT reveal whether the email exists
    if not user:
        return {"message": "If that email exists, an OTP has been sent."}

    otp = generate_otp()
    hashed_otp = hash_password(otp)

    await db["otp_codes"].delete_many({"user_id": str(user["_id"])})

    await db["otp_codes"].insert_one({
        "user_id": str(user["_id"]),
        "email": email,
        "otp_hash": hashed_otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "used": False,
        "created_at": utc_now_str(),
    })

    await send_otp_email(email, otp)

    return {"message": "If that email exists, an OTP has been sent."}


async def verify_otp_and_reset(payload: VerifyOTPAndResetRequest) -> dict:
    """
    Verify OTP and reset the user's password.
    """
    db = get_database()
    email = payload.email.strip().lower()
    otp = payload.otp.strip()

    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    otp_doc = await db["otp_codes"].find_one({
        "user_id": str(user["_id"]),
        "email": email,
        "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)},
    }, sort=[("created_at", -1)])

    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid OTP found. Please request a new one."
        )

    if not verify_password(otp, otp_doc["otp_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    await db["otp_codes"].update_one(
        {"_id": otp_doc["_id"]},
        {"$set": {"used": True}}
    )

    new_password_hash = hash_password(payload.new_password)

    result = await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_password_hash, "updated_at": utc_now_str()}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "Password reset successful. You can now log in."}