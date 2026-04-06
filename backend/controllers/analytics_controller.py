from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from config.database import get_database


_VALID_TIME_RANGES = {"week", "month", "year"}


def _validate_time_range(time_range: str) -> str:
    normalized = (time_range or "week").strip().lower()
    if normalized not in _VALID_TIME_RANGES:
        raise HTTPException(status_code=400, detail="Invalid range. Use 'week', 'month', or 'year'.")
    return normalized


def _month_periods(now: datetime, count: int) -> list[tuple[datetime, datetime, str]]:
    periods: list[tuple[datetime, datetime, str]] = []
    for offset in range(count - 1, -1, -1):
        total_months = now.month - offset - 1
        year = now.year + (total_months // 12)
        month = (total_months % 12) + 1
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        periods.append((start, end, start.strftime("%b %Y")))
    return periods


def _day_periods(now: datetime, count: int) -> list[tuple[datetime, datetime, str]]:
    periods: list[tuple[datetime, datetime, str]] = []
    for offset in range(count - 1, -1, -1):
        day = (now - timedelta(days=offset)).date()
        start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        end = start + timedelta(days=1)
        periods.append((start, end, day.isoformat()))
    return periods


async def get_user_growth_data(time_range: str = "month") -> list[dict]:
    db = get_database()
    now = datetime.now(timezone.utc)
    normalized_range = _validate_time_range(time_range)

    if normalized_range == "year":
        periods = _month_periods(now, 12)
        key = "month"
    else:
        periods = _day_periods(now, 7 if normalized_range == "week" else 30)
        key = "date"

    data = []
    for start, end, label in periods:
        count = await db["users"].count_documents({
            "role": "user",
            "created_at": {
                "$gte": start.isoformat(),
                "$lt": end.isoformat(),
            },
        })
        data.append({key: label, "users": count})

    return data


async def get_active_users_data(time_range: str = "week") -> list[dict]:
    db = get_database()
    now = datetime.now(timezone.utc)
    normalized_range = _validate_time_range(time_range)

    if normalized_range == "year":
        periods = _month_periods(now, 12)
        key = "month"
    else:
        periods = _day_periods(now, 7 if normalized_range == "week" else 30)
        key = "day"

    data = []
    for _, end, label in periods:
        count = await db["users"].count_documents({
            "role": "user",
            "status": "active",
            "created_at": {"$lte": end.isoformat()},
        })
        data.append({key: label, "active": count})

    return data


async def get_workout_logs_data(time_range: str = "week") -> list[dict]:
    db = get_database()
    now = datetime.now(timezone.utc)
    normalized_range = _validate_time_range(time_range)

    if normalized_range == "year":
        periods = _month_periods(now, 12)
        key = "day"
    else:
        periods = _day_periods(now, 7 if normalized_range == "week" else 30)
        key = "day"

    data = []
    for start, end, label in periods:
        logs = await db["workout_logs"].count_documents({
            "date": {
                "$gte": start.isoformat(),
                "$lt": end.isoformat(),
            },
        })
        data.append({key: label, "logs": logs})

    return data


async def get_system_summary() -> dict:
    """High-level counts shown on AdminDashboard."""
    db = get_database()
    total_users = await db["users"].count_documents({"role": "user"})
    total_trainers = await db["users"].count_documents({"role": "trainer"})
    active_users = await db["users"].count_documents(
        {"role": "user", "status": "active"}
    )
    return {
        "total_users": total_users,
        "total_trainers": total_trainers,
        "active_users": active_users,
        "server_uptime": "99.9%",
    }
