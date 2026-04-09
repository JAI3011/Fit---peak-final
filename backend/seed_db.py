"""
seed_db.py
==========
Populates MongoDB with sample data for local development.

Usage:
    python seed_db.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from utils.security import hash_password

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "Fit-peak")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def today_date() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def current_week_dates() -> dict[str, str]:
    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())
    return {
        "Monday": (monday + timedelta(days=0)).isoformat(),
        "Tuesday": (monday + timedelta(days=1)).isoformat(),
        "Wednesday": (monday + timedelta(days=2)).isoformat(),
        "Thursday": (monday + timedelta(days=3)).isoformat(),
        "Friday": (monday + timedelta(days=4)).isoformat(),
        "Saturday": (monday + timedelta(days=5)).isoformat(),
    }


USERS = [
    # Admin — unchanged
    {
        "name": "Super Admin",
        "email": "admin@fitpeak.com",
        "password_hash": hash_password("Admin@123"),
        "role": "admin",
        "status": "active",    # ✅ admin is always active
        "joined": "2024-01-01",
        "created_at": now(),
        "calories_goal": 2400,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": None,
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
        "client_count": 0,
    },

    # ✅ FIXED — Trainer A: already approved (active) — represents approved trainer
    {
        "name": "Rahul Sharma",
        "email": "trainer@fitpeak.com",
        "password_hash": hash_password("Trainer@123"),
        "role": "trainer",
        "status": "active",    # ✅ This seed trainer is pre-approved for dev convenience
        "joined": "2024-02-01",
        "created_at": now(),
        "certification": "NASM-CPT",
        "experience": "8 years",
        "specialization": "Strength Training",
        "client_count": 2,
        "calories_goal": 2800,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": None,
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
    },

    # ✅ NEW — Trainer B: pending approval — demonstrates the approval flow
    {
        "name": "Priya Desai",
        "email": "trainer_pending@fitpeak.com",
        "password_hash": hash_password("Trainer@123"),
        "role": "trainer",
        "status": "pending",   # ✅ Shows pending approval flow in dev
        "joined": "2024-02-15",
        "created_at": now(),
        "certification": "ACE-CPT",
        "experience": "3 years",
        "specialization": "Weight Loss",
        "client_count": 0,
        "calories_goal": 2200,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": None,
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
    },

    # User 1 — unchanged
    {
        "name": "Jaysmin Patel",
        "email": "user@fitpeak.com",
        "password_hash": hash_password("User@123"),
        "role": "user",
        "status": "active",
        "joined": "2024-03-01",
        "created_at": now(),
        "age": 22,
        "height": 170,
        "weight": 70,
        "gender": "female",
        "goal": "muscle_gain",
        "calories_goal": 2400,
        "calories_consumed": 1800,
        "overall_progress": 65,
        "macros": {"protein": 120, "carbs": 200, "fats": 55},
        "trainer_id": None,   # set below after insert
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [
            {
                "date": "2024-03-01", "weight": 70,
                "workouts": 4, "volume": 12000,
                "calories": 2300, "protein": 120,
                "carbs": 200, "fats": 55
            },
            {
                "date": "2024-03-08", "weight": 69.5,
                "workouts": 5, "volume": 14000,
                "calories": 2400, "protein": 130,
                "carbs": 210, "fats": 50
            },
            {
                "date": "2024-03-15", "weight": 69.2,
                "workouts": 4, "volume": 13000,
                "calories": 2350, "protein": 125,
                "carbs": 205, "fats": 52
            },
        ],
    },
]

WORKOUTS = [
    {
        "name": "Chest + Triceps",
        "description": "Heavy push day",
        "day": "Monday",
        "duration": "45 min",
        "intensity": "High",
        "exercises": [
            {"name": "Bench Press", "category": "Chest", "equipment": "Barbell", "sets": 4, "reps": 8, "rest": 90},
            {"name": "Incline DB Press", "category": "Chest", "equipment": "Dumbbell", "sets": 3, "reps": 10, "rest": 60},
            {"name": "Tricep Pushdown", "category": "Arms", "equipment": "Machine", "sets": 3, "reps": 12, "rest": 60},
        ],
        "created_at": now(),
    },
    {
        "name": "Back + Biceps",
        "description": "Pull day — lat focus",
        "day": "Wednesday",
        "duration": "50 min",
        "intensity": "Medium",
        "exercises": [
            {"name": "Deadlift", "category": "Back", "equipment": "Barbell", "sets": 4, "reps": 5, "rest": 120},
            {"name": "Pull-Ups", "category": "Back", "equipment": "Bodyweight", "sets": 3, "reps": 10, "rest": 90},
            {"name": "Barbell Curl", "category": "Arms", "equipment": "Barbell", "sets": 3, "reps": 10, "rest": 60},
        ],
        "created_at": now(),
    },
]

DIET_PLANS = [
    {
        "name": "High Protein Muscle Plan",
        "description": "2800 kcal muscle-gain plan",
        "daily_calories": 2800,
        "daily_protein": 180,
        "duration": "8 weeks",
        "meals": [
            {
                "name": "Breakfast",
                "time": "07:00",
                "items": [
                    {"name": "Scrambled Eggs", "quantity": "4 eggs", "calories": 280, "protein": 24},
                    {"name": "Whole Wheat Toast", "quantity": "2 slices", "calories": 160, "protein": 8},
                ],
                "calories": 440,
                "protein": 32,
            },
            {
                "name": "Lunch",
                "time": "13:00",
                "items": [
                    {"name": "Grilled Chicken Breast", "quantity": "200g", "calories": 330, "protein": 62},
                    {"name": "Brown Rice", "quantity": "150g", "calories": 170, "protein": 4},
                ],
                "calories": 500,
                "protein": 66,
            },
        ],
        "created_at": now(),
    }
]

FEEDBACK = [
    {
        "rating": 5,
        "type": "General Feedback",
        "comment": "FitPeak completely transformed my training. The trainer assignment feature is brilliant!",
        "user_name": "Jaysmin Patel",
        "user_email": "user@fitpeak.com",
        "date": now(),
    }
]

SESSIONS = [
    {"title": "Jaysmin – Chest Day", "day": "Monday",    "time": "09:00", "type": "workout"},
    {"title": "Rohan – Back Session", "day": "Tuesday",   "time": "11:00", "type": "workout"},
    {"title": "Priya – Diet Review",  "day": "Wednesday", "time": "08:00", "type": "diet"},
    {"title": "Arjun – Leg Day",      "day": "Friday",    "time": "10:00", "type": "workout"},
    {"title": "Neha – Progress Check", "day": "Saturday", "time": "09:00", "type": "check"},
]


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    print("--- Seeding FitPeak database ---")

    # Clear existing data
    for col in ["users", "workouts", "diet_plans", "feedback", "settings", "sessions"]:
        await db[col].drop()
    print("  Done: Cleared existing collections")

    # Insert users
    result = await db["users"].insert_many(USERS)
    user_ids    = result.inserted_ids
    trainer_id  = str(user_ids[1])   # Rahul Sharma (active trainer)
    user_id     = str(user_ids[3])   # Jaysmin Patel (index shifted due to new trainer)

    await db["users"].update_one(
        {"_id": user_ids[3]},
        {"$set": {"trainer_id": trainer_id}}
    )

    print(f"  Done: Inserted {len(USERS)} users")
    print(f"     admin@fitpeak.com          / Admin@123   (admin)")
    print(f"     trainer@fitpeak.com        / Trainer@123 (trainer - active)")
    print(f"     trainer_pending@fitpeak.com / Trainer@123 (trainer - pending approval)")  # ✅ NEW
    print(f"     user@fitpeak.com           / User@123    (user)")

    # Insert workouts and link to trainer
    for w in WORKOUTS:
        w["trainer_id"] = trainer_id
    await db["workouts"].insert_many(WORKOUTS)
    print(f"  Done: Inserted {len(WORKOUTS)} workout templates")

    # Insert diet plans and link to trainer
    for d in DIET_PLANS:
        d["trainer_id"] = trainer_id
    await db["diet_plans"].insert_many(DIET_PLANS)
    print(f"  Done: Inserted {len(DIET_PLANS)} diet plan templates")

    # Insert feedback
    for f in FEEDBACK:
        f["user_id"] = user_id
    await db["feedback"].insert_many(FEEDBACK)
    print(f"  Done: Inserted {len(FEEDBACK)} feedback entries")

    # Insert sessions for the current week
    week_dates = current_week_dates()
    session_docs = []
    for session in SESSIONS:
        session_docs.append({
            "title": session["title"],
            "date": week_dates[session["day"]],
            "time": session["time"],
            "type": session["type"],
            "trainer_id": trainer_id,
            "created_at": now(),
        })
    await db["sessions"].insert_many(session_docs)
    print(f"  Done: Inserted {len(session_docs)} trainer sessions")

    # Insert settings
    # Keep the singleton settings document on the string _id "global" so the
    # controller can always resolve the same document across app restarts.
    await db["settings"].insert_one({
        "_id": "global",
        "app_name": "FitPeak",
        "support_email": "support@fitpeak.com",
        "default_calorie_goal": 2400,
        "features": {"trainer_plan_creation": True, "user_library": True},
    })
    print("  Done: Inserted default settings")

    # Create indexes
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("role")
    await db["users"].create_index("trainer_id")
    await db["workouts"].create_index("trainer_id")
    await db["diet_plans"].create_index("trainer_id")
    await db["feedback"].create_index([("date", -1)])
    await db["sessions"].create_index([("trainer_id", 1), ("date", 1)])
    print("  Done: Indexes created")

    client.close()
    print("\nSeed complete! You can now run: uvicorn main:app --reload")


if __name__ == "__main__":
    asyncio.run(seed())
