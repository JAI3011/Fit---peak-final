from fastapi import HTTPException
from bson import ObjectId

from config.database import get_database
from schemas.diet_plan import DietPlanCreateRequest
from utils.helpers import doc_to_dict, utc_now_str, validate_object_id




def _safe(doc: dict) -> dict:
    return {k: v for k, v in doc.items() if k != "password_hash"}


# ── GET all diet plans by trainer ─────────────────────────────────
async def get_diet_plans_by_trainer(trainer_id: str) -> list[dict]:
    db = get_database()
    cursor = db["diet_plans"].find({"trainer_id": trainer_id})
    results = []
    async for doc in cursor:
        results.append(doc_to_dict(doc))
    return results


# ── GET single diet plan ──────────────────────────────────────────
async def get_diet_plan_by_id(plan_id: str) -> dict:
    db = get_database()
    doc = await db["diet_plans"].find_one({"_id": validate_object_id(plan_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Diet plan not found")
    return doc_to_dict(doc)


# ── POST create diet plan ─────────────────────────────────────────
async def create_diet_plan(trainer_id: str, payload: DietPlanCreateRequest) -> dict:
    db = get_database()

    meals = [m.model_dump() for m in payload.meals]

    doc = {
        "name": payload.name,
        "description": payload.description,
        "daily_calories": payload.daily_calories,
        "daily_protein": payload.daily_protein,
        "daily_carbs": payload.daily_carbs,
        "daily_fats": payload.daily_fats,
        "duration": payload.duration,
        "day": payload.day,
        "meals": meals,
        "trainer_id": trainer_id,
        "created_at": utc_now_str(),
    }

    result = await db["diet_plans"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_dict(doc)


# ── PUT update diet plan ──────────────────────────────────────────
async def update_diet_plan(
    trainer_id: str, plan_id: str, payload: DietPlanCreateRequest
) -> dict:
    db = get_database()
    update_data = payload.model_dump(exclude_none=True)

    result = await db["diet_plans"].find_one_and_update(
        {"_id": validate_object_id(plan_id), "trainer_id": trainer_id},
        {"$set": {**update_data, "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Diet plan not found")
    return doc_to_dict(result)


# ── DELETE diet plan ──────────────────────────────────────────────
async def delete_diet_plan(trainer_id: str, plan_id: str) -> dict:
    db = get_database()
    result = await db["diet_plans"].delete_one(
        {"_id": validate_object_id(plan_id), "trainer_id": trainer_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Diet plan not found")
    return {"message": "Diet plan deleted"}


# ── POST assign diet plan to client ──────────────────────────────
async def assign_diet_plan(trainer_id: str, plan_id: str, client_id: str) -> dict:
    db = get_database()

    # ✅ Verify diet plan belongs to this trainer
    plan = await db["diet_plans"].find_one({
        "_id": validate_object_id(plan_id),
        "trainer_id": trainer_id,          # ✅ ownership check added
    })
    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Diet plan not found or you don't have permission to assign it"
        )

    # ✅ Verify client exists
    client = await db["users"].find_one({
        "_id": validate_object_id(client_id),
        "role": "user"
    })
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # ✅ Verify client belongs to this trainer
    if client.get("trainer_id") != trainer_id:
        raise HTTPException(
            status_code=403,
            detail="This client is not assigned to you"
        )

    plan_data = {
        **doc_to_dict(plan),
        "assigned_at": utc_now_str(),
    }

    update_query = {
        "$set": {
            "assigned_diet": plan_data, 
            "updated_at": utc_now_str()
        }
    }

    # If the plan is for a specific day, add it to that day,
    # otherwise, if it's for 'All Days', populate the entire schedule.
    day = plan_data.get("day")
    if day:
        update_query["$set"][f"diet_schedule.{day}"] = plan_data
    else:
        # If plan is for "All Days", store it for every day of the week
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for d in weekdays:
            update_query["$set"][f"diet_schedule.{d}"] = plan_data

    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(client_id)},
        update_query,
        return_document=True,
    )
    return _safe(doc_to_dict(result))
