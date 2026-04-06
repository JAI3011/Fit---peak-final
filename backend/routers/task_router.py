from fastapi import APIRouter, Depends
from controllers import task_controller
from middleware.auth import get_current_user, require_role
from schemas.task import TrainerAssignTasksRequest, TrainerClearTasksRequest

router = APIRouter(tags=["Tasks"])

@router.get("/tasks/today")
async def get_tasks(current_user: dict = Depends(get_current_user)):
    return await task_controller.get_today_tasks(current_user["id"])

@router.patch("/tasks/{task_id}/toggle")
async def toggle_task(task_id: str, current_user: dict = Depends(get_current_user)):
    return await task_controller.toggle_task(current_user["id"], task_id)


@router.post("/trainer/tasks/assign")
async def assign_trainer_tasks(
    payload: TrainerAssignTasksRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    return await task_controller.assign_trainer_tasks(
        trainer_id=current_user["id"],
        user_id=payload.client_id,
        tasks=[task.model_dump() for task in payload.tasks],
        date=payload.date,
    )


@router.post("/trainer/tasks/clear")
async def clear_trainer_tasks(
    payload: TrainerClearTasksRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    return await task_controller.clear_trainer_tasks(
        trainer_id=current_user["id"],
        user_id=payload.client_id,
        date=payload.date,
    )
