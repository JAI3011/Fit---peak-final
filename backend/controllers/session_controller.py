from fastapi import HTTPException
from bson import ObjectId
from config.database import get_database
from schemas.session import SessionCreateRequest
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id

async def get_sessions(trainer_id: str, start_date: str, end_date: str) -> list[dict]:
    db = get_database()
    cursor = db["sessions"].find({
        "trainer_id": trainer_id,
        "date": {"$gte": start_date, "$lte": end_date},
    }).sort("date", 1)
    sessions = []
    async for doc in cursor:
        sessions.append(doc_to_dict(doc))
    return sessions

async def create_session(trainer_id: str, payload: SessionCreateRequest) -> dict:
    db = get_database()
    doc = {
        "title": payload.title,
        "date": payload.date.isoformat(),
        "time": payload.time,
        "type": payload.type,
        "trainer_id": trainer_id,
        "created_at": utc_now_str(),
    }
    result = await db["sessions"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)

async def delete_session(trainer_id: str, session_id: str):
    db = get_database()
    result = await db["sessions"].delete_one({
        "_id": validate_object_id(session_id),
        "trainer_id": trainer_id,
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")