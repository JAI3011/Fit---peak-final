from config.database import get_database
from utils.helpers import utc_now_str

SETTINGS_DOC_ID = "global"

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
    # Settings are stored as a single named document with string _id = "global".
    doc = await db["settings"].find_one({"_id": SETTINGS_DOC_ID})
    if not doc:
        fallback_doc = await db["settings"].find_one({})
        if fallback_doc:
            fallback_doc.pop("_id", None)
            await db["settings"].replace_one(
                {"_id": SETTINGS_DOC_ID},
                {"_id": SETTINGS_DOC_ID, **fallback_doc},
                upsert=True,
            )
            if fallback_doc != _DEFAULT_SETTINGS:
                await db["settings"].delete_many({"_id": {"$ne": SETTINGS_DOC_ID}})
            return {**_DEFAULT_SETTINGS, **fallback_doc}

        # Seed defaults on first access.
        await db["settings"].insert_one({"_id": SETTINGS_DOC_ID, **_DEFAULT_SETTINGS})
        return _DEFAULT_SETTINGS
    doc.pop("_id", None)
    return doc


async def update_settings(data: dict) -> dict:
    db = get_database()
    data["updated_at"] = utc_now_str()
    await db["settings"].update_one(
        {"_id": SETTINGS_DOC_ID}, {"$set": data}, upsert=True
    )
    return await get_settings()
