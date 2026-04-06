from config.database import get_database
from utils.helpers import utc_now_str

_DEFAULT_SETTINGS = {
    "app_name": "FitPeak",
    "support_email": "support@fitpeak.com",
    "default_calorie_goal": 2400,
    "features": {
        "trainer_plan_creation": True,
        "user_library": True,
    },
}


async def get_settings() -> dict:
    db = get_database()
    doc = await db["settings"].find_one({"_id": "global"})
    if not doc:
        # Seed defaults on first access
        await db["settings"].insert_one({"_id": "global", **_DEFAULT_SETTINGS})
        return _DEFAULT_SETTINGS
    doc.pop("_id", None)
    return doc


async def update_settings(data: dict) -> dict:
    db = get_database()
    data["updated_at"] = utc_now_str()
    await db["settings"].update_one(
        {"_id": "global"}, {"$set": data}, upsert=True
    )
    return await get_settings()
