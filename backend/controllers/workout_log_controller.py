from config.database import get_database
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id
from fastapi import HTTPException


def _as_positive_float(value, default: float = 0.0) -> float:
    try:
        value = float(value)
    except (TypeError, ValueError):
        return default
    return value if value > 0 else default


def _estimate_workout_calories(exercises: list[dict], body_weight_kg: float) -> int:
    if body_weight_kg <= 0:
        body_weight_kg = 70.0

    total_sets = 0
    total_reps = 0
    total_volume = 0.0

    for exercise in exercises:
        for workout_set in exercise.get("sets", []):
            if not workout_set.get("completed", True):
                continue
            total_sets += 1
            reps = workout_set.get("reps") or 1
            weight = workout_set.get("weight") or 0
            total_reps += reps
            total_volume += weight * reps

    estimated_minutes = max(15.0, total_sets * 2.5 + total_reps * 0.2)
    average_met = 4.0

    if total_sets >= 8:
        average_met += 0.5
    if total_volume >= 5000:
        average_met += 0.5
    if total_volume >= 10000:
        average_met += 0.5

    calories_burned = average_met * 3.5 * body_weight_kg / 200.0 * estimated_minutes
    return max(1, round(calories_burned))

async def log_workout_session(user_id: str, data: dict) -> dict:
    """Save a workout session log and update user progress."""
    db = get_database()

    user_doc = await db["users"].find_one({"_id": validate_object_id(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate total volume (optional)
    total_volume = 0
    for exercise in data.get("exercises", []):
        for s in exercise.get("sets", []):
            total_volume += (s.get("weight", 0) * s.get("reps", 1))

    calories = _as_positive_float(data.get("calories"), 0.0)
    if calories <= 0:
        body_weight_kg = _as_positive_float(user_doc.get("weight"), 70.0)
        calories = _estimate_workout_calories(data.get("exercises", []), body_weight_kg)

    log_doc = {
        "user_id": user_id,
        "workout_name": data.get("workout_name", "Unnamed Workout"),
        "workout_id": data.get("workout_id"),
        "exercises": data.get("exercises", []),
        "total_volume": total_volume,
        "calories": calories,
        "date": data.get("date", utc_now_str()),
        "created_at": utc_now_str()
    }

    result = await db["workout_logs"].insert_one(log_doc)
    log_doc["_id"] = result.inserted_id
    
    # Update user's progress summary (append to progress_data)
    await db["users"].update_one(
        {"_id": validate_object_id(user_id)},
        {
            "$push": {
                "progress_data": {
                    "date": log_doc["date"],
                    "calories": calories,
                    "type": "workout"
                }
            }
        }
    )
    
    return doc_to_dict(log_doc)

async def get_user_logs(user_id: str):
    """Retrieve all workout logs for a specific user."""
    db = get_database()
    cursor = db["workout_logs"].find({"user_id": user_id}).sort("date", -1)
    logs = []
    async for doc in cursor:
        logs.append(doc_to_dict(doc))
    return logs
