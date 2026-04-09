from config.database import get_database
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id
from fastapi import HTTPException
from bson import ObjectId


def _date_key(value: str) -> str:
    return str(value)[:10]

async def log_diet_entry(user_id: str, data: dict) -> dict:
    """Save a diet log entry and update user daily stats."""
    db = get_database()
    
    # Explicit validation
    try:
        ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

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

    log_date = data.get("date", utc_now_str())
    # Extract date part (YYYY-MM-DD)
    date_only = log_date[:10]

    # Find existing log for this user and date (case-insensitive, any time)
    existing_log = await db["diet_logs"].find_one({
        "user_id": user_id,
        "date": {"$regex": f"^{date_only}"}
    })

    # Prepare log document
    log_doc = {
        "user_id": user_id,
        "meals": data.get("meals", []),
        "total_calories": total_calories,
        "total_protein": total_protein,
        "total_carbs": total_carbs,
        "total_fats": total_fats,
        "date": log_date,
        "updated_at": utc_now_str()
    }
    
    if existing_log:
        await db["diet_logs"].update_one(
            {"_id": existing_log["_id"]},
            {"$set": log_doc}
        )
        log_doc["_id"] = existing_log["_id"]
    else:
        log_doc["created_at"] = utc_now_str()
        result = await db["diet_logs"].insert_one(log_doc)
        log_doc["_id"] = result.inserted_id
    
    # If the log being updated is for "TODAY", update the user's quick-access stats
    today_key = log_date[:10] # Using the date of the log we just saved/updated
    if date_only == _date_key(utc_now_str()):
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
