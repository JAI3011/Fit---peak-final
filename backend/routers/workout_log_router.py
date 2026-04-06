from fastapi import APIRouter, Depends, HTTPException
from schemas.workout_log import WorkoutLogCreateRequest, WorkoutLogResponse
from controllers import workout_log_controller
from middleware.auth import get_current_user, require_role
from typing import List

router = APIRouter(prefix="/workout-logs", tags=["Workout Logs"])

@router.post(
    "",
    summary="Log a completed workout session",
    status_code=201
)
async def log_workout(
    payload: WorkoutLogCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """ Record a workout session for the authenticated user. """
    return await workout_log_controller.log_workout_session(current_user["id"], payload.model_dump())

@router.get(
    "/my-history",
    summary="Get my workout log history",
    response_model=List[dict]
)
async def get_my_logs(current_user: dict = Depends(get_current_user)):
    """ Returns all workout logs for the current user. """
    return await workout_log_controller.get_user_logs(current_user["id"])

@router.get(
    "/client/{client_id}",
    summary="[Trainer] Get a client's workout history",
    dependencies=[Depends(require_role("trainer", "admin"))]
)
async def get_client_logs(client_id: str):
    """ Returns workout logs for a specific client (Trainer/Admin only). """
    return await workout_log_controller.get_user_logs(client_id)
