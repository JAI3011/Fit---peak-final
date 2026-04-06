from fastapi import HTTPException
from bson import ObjectId

from config.database import get_database
from schemas.feedback import FeedbackCreateRequest
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id




# ── GET all feedback (admin) ──────────────────────────────────────
async def get_all_feedback() -> list[dict]:
    db = get_database()
    cursor = db["feedback"].find().sort("date", -1)
    results = []
    async for doc in cursor:
        results.append(doc_to_dict(doc))
    return results


# ── POST submit feedback (user / trainer) ─────────────────────────
async def create_feedback(current_user: dict, payload: FeedbackCreateRequest) -> dict:
    db = get_database()

    doc = {
        "rating": payload.rating,
        "type": payload.type,
        "comment": payload.comment,
        "user_name": current_user.get("name", "Anonymous"),
        "user_email": current_user.get("email", ""),
        "user_id": current_user.get("id"),
        "date": utc_now_str(),
    }

    result = await db["feedback"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)


# ── DELETE feedback (admin) ───────────────────────────────────────
async def delete_feedback(feedback_id: str) -> dict:
    db = get_database()
    result = await db["feedback"].delete_one({"_id": validate_object_id(feedback_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Feedback deleted"}

async def get_public_feedback() -> list[dict]:
    """Return public feedback (no emails, limit 10, newest first)."""
    db = get_database()
    cursor = db["feedback"].find(
        {}, 
        {"user_email": 0, "user_id": 0}
    ).sort("date", -1).limit(10)
    results = []
    async for doc in cursor:
        results.append(doc_to_dict(doc))
    return results