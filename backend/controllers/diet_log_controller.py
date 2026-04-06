from config.database import get_database
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id
from fastapi import HTTPException

async def log_diet_entry(user_id: str, data: dict) -> dict:
    """Save a diet log entry and update user daily stats."""
    db = get_database()
    
    # Calculate daily totals
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fats = 0
    
    for meal in data.get("meals", []):
        if meal.get("eaten"):
            total_calories += meal.get("calories", 0)
            total_protein += meal.get("protein", 0)
            total_carbs += meal.get("carbs", 0)
            total_fats += meal.get("fats", 0)

    log_doc = {
        "user_id": user_id,
        "meals": data.get("meals", []),
        "total_calories": total_calories,
        "total_protein": total_protein,
        "total_carbs": total_carbs,
        "total_fats": total_fats,
        "date": data.get("date", utc_now_str()),
        "created_at": utc_now_str()
    }

    # Use find_one_and_update to either update today's log or insert a new one
    # Note: For simplicity, we'll just insert for now, but in production, we'd check for existing date.
    
    result = await db["diet_logs"].insert_one(log_doc)
    log_doc["_id"] = result.inserted_id
    
    # Update user's current daily consumption fields
    await db["users"].update_one(
        {"_id": validate_object_id(user_id)},
        {
            "$set": {
                "calories_consumed": total_calories,
                "macros.protein": total_protein,
                "macros.carbs": total_carbs,
                "macros.fats": total_fats,
                "updated_at": utc_now_str()
            }
        }
    )
    
    return doc_to_dict(log_doc)

async def get_user_diet_logs(user_id: str):
    """Retrieve all diet logs for a specific user."""
    db = get_database()
    cursor = db["diet_logs"].find({"user_id": user_id}).sort("date", -1)
    logs = []
    async for doc in cursor:
        logs.append(doc_to_dict(doc))
    return logs
