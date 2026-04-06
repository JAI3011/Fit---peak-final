from fastapi import APIRouter, Depends, Query
from controllers import analytics_controller
from middleware.auth import require_role

router = APIRouter(prefix="/analytics", tags=["Analytics"])

_admin_only = Depends(require_role("admin"))

@router.get(
    "/user-growth",
    summary="[Admin] Monthly user signup counts",
    dependencies=[_admin_only],
)
async def user_growth(
    range: str = Query("month", description="Time range: 'week', 'month', 'year'")
):
    """Returns user signup counts for the specified range."""
    return await analytics_controller.get_user_growth_data(time_range=range)

@router.get(
    "/active-users",
    summary="[Admin] Daily active user counts",
    dependencies=[_admin_only],
)
async def active_users(
    range: str = Query("week", description="Time range: 'week', 'month', 'year'")
):
    """Returns active user counts for the specified range."""
    return await analytics_controller.get_active_users_data(time_range=range)

@router.get(
    "/workout-logs",
    summary="[Admin] Daily workout log counts",
    dependencies=[_admin_only],
)
async def workout_logs(
    range: str = Query("week", description="Time range: 'week', 'month', 'year'")
):
    """Returns workout log counts for the specified range."""
    return await analytics_controller.get_workout_logs_data(time_range=range)

@router.get(
    "/summary",
    summary="[Admin] System-level KPI summary",
    dependencies=[_admin_only],
)
async def summary():
    return await analytics_controller.get_system_summary()