from fastapi import HTTPException, status
from bson import ObjectId

from config.database import get_database
from schemas.user import AdminUserEditRequest
from utils.helpers import doc_to_dict, utc_now_str, today_date_str, validate_object_id
from utils.security import hash_password




def _safe(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "password_hash"}


# ── GET all users ─────────────────────────────────────────────────
async def get_all_users() -> list[dict]:
    db = get_database()
    cursor = db["users"].find({"role": {"$in": ["user", "trainer", "admin"]}})
    users = []
    async for doc in cursor:
        users.append(_safe(doc_to_dict(doc)))
    return users


# ── GET only role=user ────────────────────────────────────────────
async def get_users_only() -> list[dict]:
    db = get_database()
    cursor = db["users"].find({"role": "user"})
    users = []
    async for doc in cursor:
        users.append(_safe(doc_to_dict(doc)))
    return users


# ── GET only role=trainer ─────────────────────────────────────────
async def get_trainers_only() -> list[dict]:
    db = get_database()
    cursor = db["users"].find({"role": "trainer"})
    trainers = []
    async for doc in cursor:
        trainers.append(_safe(doc_to_dict(doc)))
    return trainers


# ── GET single user ───────────────────────────────────────────────
async def get_user_by_id(user_id: str) -> dict:
    db = get_database()
    doc = await db["users"].find_one({"_id": validate_object_id(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return _safe(doc_to_dict(doc))


# ── PUT update own profile (user / trainer) ───────────────────────
async def update_user_profile(user_id: str, payload: dict) -> dict:
    db = get_database()

    update_data = dict(payload)

    # Flatten macros to nested dict
    if "macros" in update_data and update_data["macros"]:
        update_data["macros"] = update_data["macros"]

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(user_id)},
        {"$set": {**update_data, "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return _safe(doc_to_dict(result))


# ── PUT admin edit any user ───────────────────────────────────────
async def admin_update_user(user_id: str, payload: AdminUserEditRequest) -> dict:
    db = get_database()
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(user_id)},
        {"$set": {**update_data, "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return _safe(doc_to_dict(result))


# ── PUT toggle user status (active ↔ inactive) ─────────────────────
async def toggle_user_status(user_id: str) -> dict:
    db = get_database()
    doc = await db["users"].find_one({"_id": validate_object_id(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    new_status = "inactive" if doc.get("status") == "active" else "active"
    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(user_id)},
        {"$set": {"status": new_status, "updated_at": utc_now_str()}},
        return_document=True,
    )
    return _safe(doc_to_dict(result))


# ── DELETE user ───────────────────────────────────────────────────
async def delete_user(user_id: str) -> dict:
    db = get_database()
    result = await db["users"].delete_one({"_id": validate_object_id(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# ── GET clients assigned to a trainer ─────────────────────────────
async def get_clients_for_trainer(trainer_id: str) -> list[dict]:
    db = get_database()
    cursor = db["users"].find({"role": "user", "trainer_id": trainer_id})
    clients = []
    async for doc in cursor:
        clients.append(_safe(doc_to_dict(doc)))
    return clients


# ── POST assign workout to client ─────────────────────────────────
async def assign_workout_to_client(client_id: str, plan: dict) -> dict:
    db = get_database()
    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(client_id)},
        {"$set": {"assigned_workout": plan, "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    return _safe(doc_to_dict(result))


# ── POST assign diet to client ────────────────────────────────────
async def assign_diet_to_client(client_id: str, plan: dict) -> dict:
    db = get_database()
    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(client_id)},
        {"$set": {"assigned_diet": plan, "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    return _safe(doc_to_dict(result))

# ── POST skip workout ────────────────────────────────────────────────
async def skip_workout(user_id: str) -> dict:
    """
    Record that the user skipped today's workout.
    Adds today's date to skipped_workout_dates array (no duplicates).
    """
    db = get_database()
    today = today_date_str()  # e.g., "2025-04-01"

    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(user_id)},
        {"$addToSet": {"skipped_workout_dates": today}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return _safe(doc_to_dict(result))

# ── POST create user by admin ──────────────────────────────────────
async def create_user_by_admin(payload: dict) -> dict:
    """
    Create a new user account. Password is set to a default value
    ('FitPeak@2024') that the user must change on first login.
    """
    db = get_database()

    # Validate required fields
    required = ["name", "email", "role"]
    for field in required:
        if field not in payload or not payload[field]:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Check for duplicate email
    existing = await db["users"].find_one({"email": payload["email"]})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Default password
    default_password = "FitPeak@2024"

    # Build user document
    doc = {
        "name": payload["name"],
        "email": payload["email"],
        "password_hash": hash_password(default_password),
        "role": payload["role"],
        "status": payload.get("status", "active"),
        "joined": today_date_str(),
        "created_at": utc_now_str(),
        # Fitness defaults
        "calories_goal": 2400,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": payload.get("trainer_id") or payload.get("trainerId"),
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
        # Trainer-specific (only used if role == 'trainer')
        "certification": None,
        "experience": None,
        "specialization": None,
        "client_count": 0,
    }

    # Convert trainer_id from string to ObjectId if provided
    if doc.get("trainer_id"):
        try:
            doc["trainer_id"] = str(ObjectId(doc["trainer_id"]))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid trainer_id format")

    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id
    user = doc_to_dict(doc)

    return _safe(user)