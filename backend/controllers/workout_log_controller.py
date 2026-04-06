from config.database import get_database
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id
from fastapi import HTTPException

async def log_workout_session(user_id: str, data: dict) -> dict:
    """Save a workout session log and update user progress."""
    db = get_database()
    
    # Calculate total volume (optional)
    total_volume = 0
    for exercise in data.get("exercises", []):
        for s in exercise.get("sets", []):
            total_volume += (s.get("weight", 0) * s.get("reps", 1))

    log_doc = {
        "user_id": user_id,
        "workout_name": data.get("workout_name", "Unnamed Workout"),
        "workout_id": data.get("workout_id"),
        "exercises": data.get("exercises", []),
        "total_volume": total_volume,
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
                    "calories": 300, # Estimated burn or from data
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
