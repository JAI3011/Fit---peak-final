from fastapi import APIRouter, Depends
from controllers import settings_controller
from middleware.auth import require_role

router = APIRouter(prefix="/settings", tags=["Settings"])

_admin_only = Depends(require_role("admin"))


@router.get(
    "",
    summary="[Admin] Get system settings",
    dependencies=[_admin_only],
)
async def get_settings():
    return await settings_controller.get_settings()


@router.put(
    "",
    summary="[Admin] Update system settings",
    dependencies=[_admin_only],
)
async def update_settings(data: dict):
    """
    Accepts a partial or full settings object:
    ```json
    {
      "app_name": "FitPeak",
      "support_email": "help@fitpeak.com",
      "default_calorie_goal": 2400,
      "features": {
        "trainer_plan_creation": true,
        "user_library": true
      }
    }
    ```
    """
    return await settings_controller.update_settings(data)
