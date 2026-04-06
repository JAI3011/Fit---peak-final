"""
MongoDB Collection Schemas
==========================
This file documents the shape of each MongoDB collection used by FitPeak.
Motor (async) works with plain Python dicts — these are for reference only.

Run seed_db.py to populate sample data for development.
"""

# ── users ─────────────────────────────────────────────────────────
USERS_SCHEMA = {
    "_id": "ObjectId",
    "name": "str",
    "email": "str (unique index)",
    "password_hash": "str (bcrypt)",
    "role": "user | trainer | admin",
    "status": "active | inactive | pending",
    "joined": "YYYY-MM-DD",
    "created_at": "ISO datetime",
    "updated_at": "ISO datetime | None",

    # Fitness profile (role=user)
    "age": "int | None",
    "height": "float (cm) | None",
    "weight": "float (kg) | None",
    "gender": "male | female | other | None",
    "goal": "weight_loss | muscle_gain | endurance | None",
    "calories_goal": "int (default 2400)",
    "calories_consumed": "int (default 0)",
    "overall_progress": "float 0-100 (default 0)",
    "macros": {
        "protein": "float (g)",
        "carbs": "float (g)",
        "fats": "float (g)",
    },
    "trainer_id": "str (ObjectId ref) | None",
    "assigned_workout": "dict | None",   # snapshot of workouts doc
    "assigned_diet": "dict | None",       # snapshot of diet_plans doc
    "skipped_workout_dates": "list of ISO datetime strings (skipped days)",
    "progress_data": [
        {
            "date": "YYYY-MM-DD",
            "weight": "float",
            "workouts": "int",
            "volume": "int",
            "calories": "int",
            "protein": "int",
            "carbs": "int",
            "fats": "int",
        }
    ],

    # Trainer-specific (role=trainer)
    "certification": "str | None",
    "experience": "str | None",
    "specialization": "str | None",
    "client_count": "int (default 0)",
}


# ── workouts ──────────────────────────────────────────────────────
WORKOUTS_SCHEMA = {
    "_id": "ObjectId",
    "name": "str",
    "description": "str | None",
    "day": "Monday | Tuesday | … | None",
    "duration": "str (e.g. '45-60 min')",
    "intensity": "Low | Medium | High",
    "trainer_id": "str (ObjectId ref)",
    "created_at": "ISO datetime",
    "updated_at": "ISO datetime | None",
    "exercises": [
        {
            "id": "str | None",
            "name": "str",
            "category": "str | None",
            "equipment": "str | None",
            "sets": "int",
            "reps": "int",
            "rest": "int (seconds)",
        }
    ],
}


# ── diet_plans ────────────────────────────────────────────────────
DIET_PLANS_SCHEMA = {
    "_id": "ObjectId",
    "name": "str",
    "description": "str | None",
    "daily_calories": "int",
    "daily_protein": "int",
    "duration": "str (e.g. 'Flexible', '4 weeks')",
    "trainer_id": "str (ObjectId ref)",
    "created_at": "ISO datetime",
    "updated_at": "ISO datetime | None",
    "meals": [
        {
            "id": "str | None",
            "name": "str",
            "time": "HH:MM | None",
            "items": [
                {
                    "name": "str",
                    "quantity": "str",
                    "calories": "int",
                    "protein": "int",
                }
            ],
            "calories": "int (auto-sum)",
            "protein": "int (auto-sum)",
        }
    ],
}


# ── feedback ──────────────────────────────────────────────────────
FEEDBACK_SCHEMA = {
    "_id": "ObjectId",
    "rating": "int 0-5",
    "type": "Bug Report | Feature Request | General Feedback | Trainer Feedback",
    "comment": "str",
    "user_name": "str",
    "user_email": "str",
    "user_id": "str (ObjectId ref)",
    "date": "ISO datetime",
}


# ── settings ──────────────────────────────────────────────────────
SETTINGS_SCHEMA = {
    "_id": "global",   # single-document collection
    "app_name": "str",
    "support_email": "str",
    "default_calorie_goal": "int",
    "features": {
        "trainer_plan_creation": "bool",
        "user_library": "bool",
    },
    "updated_at": "ISO datetime | None",
}
