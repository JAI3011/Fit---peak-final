from config.database import get_database
from utils.helpers import doc_to_dict


import random
from datetime import datetime, timezone, timedelta


WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

AI_TIPS = [
    "Increase protein intake and maintain hydration.",
    "Try adding 5 minutes of stretching after your workout.",
    "Focus on slow, controlled movements today.",
    "Don't forget to track your water intake!",
    "A 10-minute walk after meals can help digestion.",
    "Sleep at least 7-8 hours for optimal muscle recovery.",
    "Pre-workout caffeine can boost your performance by 10%.",
    "Consistency is better than perfection. Keep going!"
]

def get_next_meal(meals: dict) -> str:
    """Determine the next meal based on current hour."""
    if not meals:
        return "No plan assigned"
    
    hour = datetime.now().hour
    if hour < 10: return "Breakfast"
    if hour < 12: return "Mid-Morning Snack"
    if hour < 15: return "Lunch"
    if hour < 19: return "Evening Snack"
    if hour < 22: return "Dinner"
    return "Late Night Snack"


def _get_week_bounds() -> tuple[str, str, list[str]]:
    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    week_dates = [(monday + timedelta(days=index)).isoformat() for index in range(7)]
    return monday.isoformat(), sunday.isoformat(), week_dates


def _extract_focus(title: str, fallback: str) -> str:
    if not title:
        return fallback

    for separator in (" - ", " – ", " — "):
        if separator in title:
            tail = title.split(separator, 1)[1].strip()
            if tail:
                return tail

    if "Session" in title:
        return title.replace("Session", "").strip(" -–—") or fallback

    return title


def _parse_iso_date(value: str | None):
    if not value or not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _compute_workout_streak(workout_dates: set) -> int:
    if not workout_dates:
        return 0

    streak = 0
    cursor = datetime.now(timezone.utc).date()
    while cursor in workout_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


async def _build_achievements(db, user_id: str, overall_progress: float) -> list[dict]:
    workout_count = await db["workout_logs"].count_documents({"user_id": user_id})

    workout_cursor = db["workout_logs"].find(
        {"user_id": user_id},
        {"date": 1}
    )
    workout_dates = set()
    async for workout_doc in workout_cursor:
        date_value = _parse_iso_date(workout_doc.get("date"))
        if date_value:
            workout_dates.add(date_value)

    streak_days = _compute_workout_streak(workout_dates)

    mission_master_unlocked = False
    task_cursor = db["tasks"].find({"userId": user_id}, {"tasks": 1})
    async for task_doc in task_cursor:
        tasks = task_doc.get("tasks") or []
        if tasks and all(task.get("completed") for task in tasks):
            mission_master_unlocked = True
            break

    achievements = [
        {
            "id": "streak-7",
            "title": "7 Day Streak",
            "icon": "flame",
            "unlocked": streak_days >= 7,
            "progress": min(streak_days, 7),
            "target": 7,
        },
        {
            "id": "first-workout",
            "title": "First Workout",
            "icon": "trophy",
            "unlocked": workout_count >= 1,
            "progress": min(workout_count, 1),
            "target": 1,
        },
        {
            "id": "mission-master",
            "title": "Mission Master",
            "icon": "medal",
            "unlocked": mission_master_unlocked,
            "progress": 1 if mission_master_unlocked else 0,
            "target": 1,
        },
        {
            "id": "progress-50",
            "title": "Halfway There",
            "icon": "target",
            "unlocked": overall_progress >= 50,
            "progress": min(int(overall_progress), 50),
            "target": 50,
        },
    ]

    return achievements

async def get_user_dashboard(current_user: dict) -> dict:
    """
    Returns the logged-in user's full profile including
    trainer name, assigned plans, macros, and progress data.
    """
    db = get_database()

    trainer_name = "Not Assigned"
    if current_user.get("trainer_id"):
        from bson import ObjectId

        try:
            trainer_doc = await db["users"].find_one(
                {"_id": ObjectId(current_user["trainer_id"])}
            )
            if trainer_doc:
                trainer_name = trainer_doc.get("name", "Not Assigned")
        except Exception:
            pass

    # Extract assigned diet meals if present
    meals = {}
    if current_user.get("assigned_diet") and isinstance(current_user["assigned_diet"], dict):
        meals = current_user["assigned_diet"].get("meals", {})

    weekly_schedule = []
    week_start, week_end, week_dates = _get_week_bounds()
    today = datetime.now(timezone.utc).date().isoformat()

    if current_user.get("trainer_id"):
        cursor = db["sessions"].find({
            "trainer_id": current_user["trainer_id"],
            "date": {"$gte": week_start, "$lte": week_end},
        }).sort("date", 1)

        sessions_by_date: dict[str, dict] = {}
        async for doc in cursor:
            session = doc_to_dict(doc)
            sessions_by_date[session.get("date", "")] = session

        for index, day_date in enumerate(week_dates):
            session = sessions_by_date.get(day_date)
            day_label = WEEKDAY_LABELS[index]

            if session:
                status = "today" if day_date == today else ("done" if day_date < today else "pending")
                weekly_schedule.append({
                    "date": day_date,
                    "day": day_label,
                    "focus": _extract_focus(session.get("title", "Session"), session.get("type", "Workout").title()),
                    "status": status,
                    "summary": f"{session.get('type', 'workout').title()} session at {session.get('time', '00:00')}",
                    "note": session.get("title", "Trainer session"),
                    "time": session.get("time"),
                    "type": session.get("type"),
                    "title": session.get("title"),
                })
            else:
                weekly_schedule.append({
                    "date": day_date,
                    "day": day_label,
                    "focus": "Rest",
                    "status": "rest",
                    "summary": "No trainer session scheduled.",
                    "note": "Recovery day and mobility work.",
                    "time": None,
                    "type": "rest",
                    "title": "Rest Day",
                })

    if not weekly_schedule:
        weekly_schedule = [
            {
                "date": week_dates[index],
                "day": WEEKDAY_LABELS[index],
                "focus": "Rest",
                "status": "rest",
                "summary": "No trainer session scheduled.",
                "note": "Recovery day and mobility work.",
                "time": None,
                "type": "rest",
                "title": "Rest Day",
            }
            for index in range(7)
        ]

    user_id = current_user.get("id")
    achievements = []
    if user_id:
        achievements = await _build_achievements(
            db,
            user_id,
            float(current_user.get("overall_progress") or 0),
        )

    return {
        **{k: v for k, v in current_user.items() if k != "password_hash"},
        "trainer_name": trainer_name,
        "daily_tip": random.choice(AI_TIPS),
        "next_meal_suggestion": get_next_meal(meals),
        "today_workout_name": (current_user.get("assigned_workout") or {}).get("name", "Rest Day"),
        "weekly_schedule": weekly_schedule,
        "achievements": achievements,
    }
