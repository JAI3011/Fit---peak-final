from fastapi import APIRouter, Depends
from controllers import dashboard_controller
from middleware.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    summary="Get the current user's personalised dashboard data",
)
async def get_dashboard(
    timezone_offset_minutes: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """
    Returns the full profile of the currently authenticated user,
    including trainer name, assigned plans, macros, and progress data.
    Used by UserDashboard.jsx → FitnessContext.jsx.
    """
    return await dashboard_controller.get_user_dashboard(current_user, timezone_offset_minutes)
