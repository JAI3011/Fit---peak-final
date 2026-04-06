from fastapi import HTTPException
from bson import ObjectId

from config.database import get_database
from schemas.workout import WorkoutCreateRequest
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id




# ── GET all workouts by trainer ───────────────────────────────────
async def get_workouts_by_trainer(trainer_id: str) -> list[dict]:
    db = get_database()
    cursor = db["workouts"].find({"trainer_id": trainer_id})
    results = []
    async for doc in cursor:
        results.append(doc_to_dict(doc))
    return results


# ── GET single workout ────────────────────────────────────────────
async def get_workout_by_id(workout_id: str) -> dict:
    db = get_database()
    doc = await db["workouts"].find_one({"_id": validate_object_id(workout_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Workout not found")
    return doc_to_dict(doc)


# ── POST create workout ───────────────────────────────────────────
async def create_workout(trainer_id: str, payload: WorkoutCreateRequest) -> dict:
    db = get_database()

    exercises = [ex.model_dump() for ex in payload.exercises]

    doc = {
        "name": payload.name,
        "description": payload.description,
        "day": payload.day,
        "exercises": exercises,
        "duration": payload.duration,
        "intensity": payload.intensity,
        "trainer_id": trainer_id,
        "created_at": utc_now_str(),
    }

    result = await db["workouts"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)


# ── PUT update workout ────────────────────────────────────────────
async def update_workout(trainer_id: str, workout_id: str, payload: WorkoutCreateRequest) -> dict:
    db = get_database()
    update_data = payload.model_dump(exclude_none=True)
    
    # ✅ Re-serialize each exercise as a clean dict (validated by Pydantic already)
    if "exercises" in update_data:
        update_data["exercises"] = [
            ex if isinstance(ex, dict) else ex.model_dump()
            for ex in payload.exercises          # use original Pydantic objects
        ]

    result = await db["workouts"].find_one_and_update(
        {"_id": validate_object_id(workout_id), "trainer_id": trainer_id},
        {"$set": {**update_data, "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Workout not found")
    return doc_to_dict(result)


# ── DELETE workout ────────────────────────────────────────────────
async def delete_workout(trainer_id: str, workout_id: str) -> dict:
    db = get_database()
    result = await db["workouts"].delete_one(
        {"_id": validate_object_id(workout_id), "trainer_id": trainer_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"message": "Workout deleted"}


# ── POST assign workout to client ─────────────────────────────────
async def assign_workout(trainer_id: str, workout_id: str, client_id: str) -> dict:
    db = get_database()

    # ✅ Verify workout exists AND belongs to this trainer
    workout = await db["workouts"].find_one({
        "_id": validate_object_id(workout_id),
        "trainer_id": trainer_id,          # ✅ ownership check added
    })
    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found or you don't have permission to assign it"
        )

    # ✅ Verify client exists
    client = await db["users"].find_one({
        "_id": validate_object_id(client_id),
        "role": "user"
    })
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # ✅ Verify this client is actually assigned to this trainer
    if client.get("trainer_id") != trainer_id:
        raise HTTPException(
            status_code=403,
            detail="This client is not assigned to you"
        )

    plan_data = {
        **doc_to_dict(workout),
        "assigned_at": utc_now_str(),
    }

    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(client_id)},
        {"$set": {"assigned_workout": plan_data, "updated_at": utc_now_str()}},
        return_document=True,
    )

    def _safe(d):
        return {k: v for k, v in d.items() if k != "password_hash"}

    return _safe(doc_to_dict(result))
