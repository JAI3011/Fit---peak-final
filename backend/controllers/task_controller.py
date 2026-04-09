from datetime import datetime

from fastapi import HTTPException, status
from bson import ObjectId

from config.database import get_database
from utils.helpers import doc_to_dict, utc_now_str, today_date_str


MISSION_TEMPLATE_VERSION = 2

LEGACY_STATIC_TASKS = (
    ("1", "Morning Jog (30 mins)"),
    ("2", "Drink 2L Water"),
    ("3", "Strength Training"),
)

ALLOWED_TASK_PRIORITIES = {"low", "medium", "high"}
ALLOWED_TASK_CATEGORIES = {"workout", "nutrition", "recovery", "tracking", "custom"}


def _serialize_task_doc(task_doc: dict | None) -> dict | None:
    if not task_doc:
        return task_doc

    serialized = dict(task_doc)
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
    return serialized


def _normalize_priority(priority: str | None) -> str:
    value = (priority or "").strip().lower()
    if value in ALLOWED_TASK_PRIORITIES:
        return value
    return "medium"


def _normalize_category(category: str | None) -> str:
    value = (category or "").strip().lower()
    if value in ALLOWED_TASK_CATEGORIES:
        return value
    return "custom"


def _normalize_trainer_tasks(tasks: list[dict]) -> list[dict]:
    normalized = []

    for index, task in enumerate(tasks):
        if not isinstance(task, dict):
            continue

        text = (task.get("text") or "").strip()
        if not text:
            continue

        task_id = (task.get("id") or "").strip() or f"trainer-{index + 1}"
        normalized.append(
            {
                "id": task_id,
                "text": text[:160],
                "completed": False,
                "category": _normalize_category(task.get("category")),
                "priority": _normalize_priority(task.get("priority")),
            }
        )

    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="At least one mission with text is required",
        )

    return normalized[:10]


def _resolve_assignment_date(date: str | None) -> str:
    assignment_date = (date or today_date_str()).strip()
    try:
        datetime.strptime(assignment_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Date must be in YYYY-MM-DD format",
        )

    return assignment_date


def _normalize_goal(goal: str | None) -> str:
    return (goal or "").strip().lower()


def _as_positive_int(value, fallback: int) -> int:
    try:
        number = int(round(float(value)))
        return number if number > 0 else fallback
    except (TypeError, ValueError):
        return fallback


def _resolve_protein_goal(user: dict, goal: str) -> int:
    macros = user.get("macros") or {}
    if macros.get("protein"):
        return _as_positive_int(macros.get("protein"), 100)

    calories_goal = _as_positive_int(user.get("calories_goal"), 2400)
    if goal == "muscle_gain":
        return max(120, round(calories_goal * 0.30 / 4))
    if goal == "endurance":
        return max(90, round(calories_goal * 0.22 / 4))
    return max(80, round(calories_goal * 0.25 / 4))


def _get_workout_focus(user: dict) -> str:
    workout = user.get("assigned_workout") or {}
    if not isinstance(workout, dict):
        return "your workout"

    workout_name = workout.get("name")
    if workout_name:
        return workout_name

    exercises = workout.get("exercises") or []
    if exercises and isinstance(exercises, list):
        first_exercise = exercises[0] or {}
        if isinstance(first_exercise, dict) and first_exercise.get("name"):
            return first_exercise["name"]

    return "your workout"


def _get_diet_focus(user: dict) -> str:
    diet = user.get("assigned_diet") or {}
    if not isinstance(diet, dict):
        return "your diet plan"

    return diet.get("name") or "your diet plan"


def _build_daily_tasks(user: dict) -> list[dict]:
    goal = _normalize_goal(user.get("goal"))
    calories_goal = _as_positive_int(user.get("calories_goal"), 2400)
    protein_goal = _resolve_protein_goal(user, goal)
    workout_focus = _get_workout_focus(user)
    diet_focus = _get_diet_focus(user)
    progress = float(user.get("overall_progress") or 0)

    if goal == "muscle_gain":
        return [
            {
                "id": "muscle-1",
                "text": f"Complete {workout_focus} with full effort",
                "completed": False,
                "category": "workout",
                "priority": "high",
            },
            {
                "id": "muscle-2",
                "text": f"Reach about {protein_goal}g protein today",
                "completed": False,
                "category": "nutrition",
                "priority": "high",
            },
            {
                "id": "muscle-3",
                "text": "Finish 10 minutes of mobility and stretching",
                "completed": False,
                "category": "recovery",
                "priority": "medium",
            },
        ]

    if goal == "endurance":
        return [
            {
                "id": "endurance-1",
                "text": f"Complete your cardio or interval session for {workout_focus}",
                "completed": False,
                "category": "workout",
                "priority": "high",
            },
            {
                "id": "endurance-2",
                "text": "Stay hydrated and include an electrolyte break",
                "completed": False,
                "category": "nutrition",
                "priority": "high",
            },
            {
                "id": "endurance-3",
                "text": "Review pacing, breathing, and recovery notes",
                "completed": False,
                "category": "tracking",
                "priority": "medium",
            },
        ]

    if goal == "weight_loss":
        return [
            {
                "id": "weight-loss-1",
                "text": f"Move for 30 minutes with {workout_focus}",
                "completed": False,
                "category": "workout",
                "priority": "high",
            },
            {
                "id": "weight-loss-2",
                "text": f"Keep calories near {calories_goal} kcal and log every meal",
                "completed": False,
                "category": "nutrition",
                "priority": "high",
            },
            {
                "id": "weight-loss-3",
                "text": "Drink 2L of water and finish a 10-minute walk",
                "completed": False,
                "category": "recovery",
                "priority": "medium",
            },
        ]

    tasks = [
        {
            "id": "balance-1",
            "text": f"Complete today's session with {workout_focus}",
            "completed": False,
            "category": "workout",
            "priority": "high",
        },
        {
            "id": "balance-2",
            "text": f"Follow {diet_focus} and stay close to {calories_goal} kcal",
            "completed": False,
            "category": "nutrition",
            "priority": "high",
        },
    ]

    if progress >= 60:
        tasks.append(
            {
                "id": "balance-3",
                "text": "Focus on recovery, sleep, and mobility work",
                "completed": False,
                "category": "recovery",
                "priority": "medium",
            }
        )
    else:
        tasks.append(
            {
                "id": "balance-3",
                "text": f"Hit around {protein_goal}g protein and keep hydration steady",
                "completed": False,
                "category": "nutrition",
                "priority": "medium",
            }
        )

    return tasks


def _matches_legacy_default(task_doc: dict) -> bool:
    tasks = task_doc.get("tasks") or []
    if len(tasks) != len(LEGACY_STATIC_TASKS):
        return False

    for task, (expected_id, expected_text) in zip(tasks, LEGACY_STATIC_TASKS):
        if str(task.get("id")) != expected_id:
            return False
        if task.get("text") != expected_text:
            return False

    return True


def _should_refresh_today_tasks(task_doc: dict) -> bool:
    if task_doc.get("assignmentSource") == "trainer":
        return False

    if task_doc.get("missionVersion") == MISSION_TEMPLATE_VERSION:
        return False

    if not _matches_legacy_default(task_doc):
        return False

    return not any(task.get("completed", False) for task in task_doc.get("tasks", []))


async def get_today_tasks(user_id: str) -> dict:
    db = get_database()
    today = today_date_str()
    task_doc = await db["tasks"].find_one({"userId": user_id, "date": today})

    profile = {}
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user_doc:
            profile = doc_to_dict(user_doc)
    except Exception:
        profile = {}

    if task_doc and _should_refresh_today_tasks(task_doc):
        task_doc["tasks"] = _build_daily_tasks(profile)
        task_doc["missionVersion"] = MISSION_TEMPLATE_VERSION
        task_doc["generatedFor"] = {
            "goal": profile.get("goal"),
            "trainerId": profile.get("trainer_id"),
        }
        await db["tasks"].update_one(
            {"_id": task_doc["_id"]},
            {
                "$set": {
                    "tasks": task_doc["tasks"],
                    "missionVersion": task_doc["missionVersion"],
                    "generatedFor": task_doc["generatedFor"],
                }
            },
        )
        return _serialize_task_doc(task_doc)

    if not task_doc:
        task_doc = {
            "userId": user_id,
            "date": today,
            "missionVersion": MISSION_TEMPLATE_VERSION,
            "generatedFor": {
                "goal": profile.get("goal"),
                "trainerId": profile.get("trainer_id"),
            },
            "tasks": _build_daily_tasks(profile),
        }
        result = await db["tasks"].insert_one(task_doc)
        task_doc["_id"] = result.inserted_id

    return _serialize_task_doc(task_doc)


async def assign_trainer_tasks(
    trainer_id: str,
    user_id: str,
    tasks: list[dict],
    date: str | None = None,
) -> dict:
    db = get_database()

    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user id: {user_id}",
        )

    user_doc = await db["users"].find_one({"_id": user_object_id, "role": "user"})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Client not found")

    if user_doc.get("trainer_id") != trainer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only assign missions to your own clients",
        )

    assignment_date = _resolve_assignment_date(date)

    normalized_tasks = _normalize_trainer_tasks(tasks)
    generated_for = {
        "goal": user_doc.get("goal"),
        "trainerId": trainer_id,
    }

    payload = {
        "tasks": normalized_tasks,
        "missionVersion": MISSION_TEMPLATE_VERSION,
        "generatedFor": generated_for,
        "assignmentSource": "trainer",
        "assignedBy": trainer_id,
        "updatedAt": utc_now_str(),
    }

    existing_doc = await db["tasks"].find_one({"userId": user_id, "date": assignment_date})
    if existing_doc:
        await db["tasks"].update_one({"_id": existing_doc["_id"]}, {"$set": payload})
        existing_doc.update(payload)
        return _serialize_task_doc(existing_doc)

    doc = {
        "userId": user_id,
        "date": assignment_date,
        "createdAt": utc_now_str(),
        **payload,
    }
    result = await db["tasks"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_task_doc(doc)


async def clear_trainer_tasks(
    trainer_id: str,
    user_id: str,
    date: str | None = None,
) -> dict:
    db = get_database()

    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user id: {user_id}",
        )

    user_doc = await db["users"].find_one({"_id": user_object_id, "role": "user"})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Client not found")

    if user_doc.get("trainer_id") != trainer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify missions for your own clients",
        )

    assignment_date = _resolve_assignment_date(date)
    generated_for = {
        "goal": user_doc.get("goal"),
        "trainerId": trainer_id,
    }
    auto_tasks = _build_daily_tasks(doc_to_dict(user_doc))
    payload = {
        "tasks": auto_tasks,
        "missionVersion": MISSION_TEMPLATE_VERSION,
        "generatedFor": generated_for,
        "assignmentSource": "auto",
        "updatedAt": utc_now_str(),
    }

    existing_doc = await db["tasks"].find_one({"userId": user_id, "date": assignment_date})
    if existing_doc:
        await db["tasks"].update_one(
            {"_id": existing_doc["_id"]},
            {
                "$set": payload,
                "$unset": {"assignedBy": ""},
            },
        )
        existing_doc.update(payload)
        existing_doc.pop("assignedBy", None)
        return _serialize_task_doc(existing_doc)

    doc = {
        "userId": user_id,
        "date": assignment_date,
        "createdAt": utc_now_str(),
        **payload,
    }
    result = await db["tasks"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_task_doc(doc)

async def toggle_task(user_id: str, task_id: str) -> dict:
    db = get_database()
    today = today_date_str()
    
    # Fetch, toggle, and save to support true toggling (not just setting to True)
    doc = await db["tasks"].find_one({"userId": user_id, "date": today})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tasks not found")
        
    updated = False
    for t in doc.get("tasks", []):
        if t["id"] == task_id:
            t["completed"] = not t.get("completed", False)
            updated = True
            break
            
    if updated:
        await db["tasks"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"tasks": doc["tasks"]}}
        )
        
    doc["_id"] = str(doc["_id"])
    return doc
