from fastapi import APIRouter, Depends
from schemas.workout import WorkoutCreateRequest
from schemas.common import MessageResponse
from controllers import workout_controller
from middleware.auth import get_current_user, require_role

router = APIRouter(prefix="/workouts", tags=["Workouts"])


# ── GET trainer's own workout templates ───────────────────────────
@router.get(
    "",
    summary="[Trainer] Get all workout templates created by me",
)
async def list_workouts(current_user: dict = Depends(require_role("trainer", "admin"))):
    return await workout_controller.get_workouts_by_trainer(current_user["id"])


# ── GET single workout ────────────────────────────────────────────
@router.get(
    "/{workout_id}",
    summary="Get a single workout template",
    dependencies=[Depends(get_current_user)],
)
async def get_workout(workout_id: str):
    return await workout_controller.get_workout_by_id(workout_id)


# ── POST create workout ───────────────────────────────────────────
@router.post(
    "",
    status_code=201,
    summary="[Trainer] Create a new workout template",
)
async def create_workout(
    payload: WorkoutCreateRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    return await workout_controller.create_workout(current_user["id"], payload)


# ── PUT update workout ────────────────────────────────────────────
@router.put(
    "/{workout_id}",
    summary="[Trainer] Update a workout template",
)
async def update_workout(
    workout_id: str,
    payload: WorkoutCreateRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    return await workout_controller.update_workout(current_user["id"], workout_id, payload)


# ── DELETE workout ────────────────────────────────────────────────
@router.delete(
    "/{workout_id}",
    response_model=MessageResponse,
    summary="[Trainer] Delete a workout template",
)
async def delete_workout(
    workout_id: str,
    current_user: dict = Depends(require_role("trainer")),
):
    return await workout_controller.delete_workout(current_user["id"], workout_id)


# ── POST assign workout to client ─────────────────────────────────
@router.post(
    "/{workout_id}/assign/{client_id}",
    summary="[Trainer] Assign this workout to a specific client",
)
async def assign_workout(
    workout_id: str,
    client_id: str,
    current_user: dict = Depends(require_role("trainer")),
):
    return await workout_controller.assign_workout(
        current_user["id"], workout_id, client_id
    )
