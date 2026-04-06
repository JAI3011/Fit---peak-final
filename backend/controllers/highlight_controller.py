from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from config.database import get_database
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id
from schemas.highlight import HighlightCreateRequest, HighlightUpdateRequest

async def get_all_highlights():
    db = get_database()
    cursor = db["highlights"].find().sort("created_at", -1)
    highlights = []
    async for doc in cursor:
        highlights.append(doc_to_dict(doc))
    return highlights

async def get_highlight(highlight_id: str):
    db = get_database()
    doc = await db["highlights"].find_one({"_id": validate_object_id(highlight_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return doc_to_dict(doc)

async def create_highlight(payload: HighlightCreateRequest):
    db = get_database()
    doc = payload.model_dump()
    doc["created_at"] = utc_now_str()
    
    result = await db["highlights"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)

async def update_highlight(highlight_id: str, payload: HighlightUpdateRequest):
    db = get_database()
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db["highlights"].find_one_and_update(
        {"_id": validate_object_id(highlight_id)},
        {"$set": {**update_data, "updated_at": utc_now_str()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return doc_to_dict(result)

async def delete_highlight(highlight_id: str):
    db = get_database()
    result = await db["highlights"].delete_one({"_id": validate_object_id(highlight_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return None
