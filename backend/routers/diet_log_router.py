from fastapi import APIRouter, Depends, HTTPException
from schemas.diet_log import DietLogCreateRequest
from controllers import diet_log_controller
from middleware.auth import get_current_user, require_role
from typing import List

router = APIRouter(prefix="/diet-logs", tags=["Diet Logs"])

@router.post(
    "",
    summary="Log a daily diet entry",
    status_code=201
)
async def log_diet(
    payload: DietLogCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """ Record daily meal consumption for the current user. """
    return await diet_log_controller.log_diet_entry(current_user["id"], payload.model_dump())

@router.get(
    "/my-history",
    summary="Get my diet log history"
)
async def get_my_diet_history(current_user: dict = Depends(get_current_user)):
    """ Returns diet logs for the current user. """
    return await diet_log_controller.get_user_diet_logs(current_user["id"])

@router.get(
    "/client/{client_id}",
    summary="[Trainer] Get a client's diet history",
    dependencies=[Depends(require_role("trainer", "admin"))]
)
async def get_client_diet_history(client_id: str):
    """ Returns diet logs for a specific client (Trainer/Admin only). """
    return await diet_log_controller.get_user_diet_logs(client_id)
