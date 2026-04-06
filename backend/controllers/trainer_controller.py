from fastapi import HTTPException, status
from bson import ObjectId

from config.database import get_database
from schemas.trainer import AddTrainerRequest
from utils.helpers import doc_to_dict, utc_now_str, today_date_str, validate_object_id
from utils.security import hash_password


def _safe(doc: dict) -> dict:
    return {k: v for k, v in doc.items() if k != "password_hash"}


# ── GET all trainers ──────────────────────────────────────────────
async def get_all_trainers() -> list[dict]:
    db = get_database()
    cursor = db["users"].find({"role": "trainer"})
    trainers = []
    async for doc in cursor:
        trainers.append(_safe(doc_to_dict(doc)))
    return trainers


# ── POST add trainer (admin) ──────────────────────────────────────
async def add_trainer(payload: AddTrainerRequest) -> dict:
    db = get_database()

    normalized_email = payload.email.strip().lower()

    existing = await db["users"].find_one({"email": normalized_email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")

    doc = {
        "name": payload.name,
        "email": normalized_email,  # ✅ normalized
        "password_hash": hash_password(payload.password or "FitPeak@2024"),  # custom or temp password
        "role": "trainer",
        "status": payload.status,
        "specialization": payload.specialization,
        "experience": payload.experience,
        "certification": payload.certification,
        "client_count": 0,
        "joined": today_date_str(),
        "created_at": utc_now_str(),
    }

    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _safe(doc_to_dict(doc))


# ── PUT approve trainer ───────────────────────────────────────────
async def approve_trainer(trainer_id: str) -> dict:
    db = get_database()
    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(trainer_id), "role": "trainer"},
        {"$set": {"status": "active", "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return _safe(doc_to_dict(result))


# ── PUT reject / deactivate trainer ──────────────────────────────
async def reject_trainer(trainer_id: str) -> dict:
    db = get_database()
    result = await db["users"].find_one_and_update(
        {"_id": validate_object_id(trainer_id), "role": "trainer"},
        {"$set": {"status": "inactive", "updated_at": utc_now_str()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return _safe(doc_to_dict(result))


# ── GET clients of a specific trainer ────────────────────────────
async def get_trainer_clients(trainer_id: str) -> list[dict]:
    db = get_database()
    cursor = db["users"].find({"role": "user", "trainer_id": trainer_id})
    clients = []
    async for doc in cursor:
        clients.append(_safe(doc_to_dict(doc)))
    return clients