from fastapi import APIRouter, Depends
from schemas.trainer import AddTrainerRequest
from controllers import trainer_controller
from middleware.auth import require_role

router = APIRouter(prefix="/trainers", tags=["Trainers"])


# ── GET all trainers ──────────────────────────────────────────────
@router.get(
    "",
    summary="[Admin] List all trainers",
    dependencies=[Depends(require_role("admin"))],
)
async def list_trainers():
    return await trainer_controller.get_all_trainers()


# ── POST add trainer ──────────────────────────────────────────────
@router.post(
    "",
    status_code=201,
    summary="[Admin] Add a new trainer account",
    dependencies=[Depends(require_role("admin"))],
)
async def add_trainer(payload: AddTrainerRequest):
    """
    Creates a trainer account with a temporary password `FitPeak@2024`.
    The trainer must reset it on first login.
    """
    return await trainer_controller.add_trainer(payload)


# ── PUT approve trainer ───────────────────────────────────────────
@router.put(
    "/{trainer_id}/approve",
    summary="[Admin] Approve a pending trainer",
    dependencies=[Depends(require_role("admin"))],
)
async def approve(trainer_id: str):
    return await trainer_controller.approve_trainer(trainer_id)


# ── PUT reject / deactivate trainer ──────────────────────────────
@router.put(
    "/{trainer_id}/reject",
    summary="[Admin] Reject / deactivate a trainer",
    dependencies=[Depends(require_role("admin"))],
)
async def reject(trainer_id: str):
    return await trainer_controller.reject_trainer(trainer_id)


# ── GET trainer's clients ─────────────────────────────────────────
@router.get(
    "/{trainer_id}/clients",
    summary="Get all clients assigned to a trainer",
    dependencies=[Depends(require_role("admin", "trainer"))],
)
async def trainer_clients(trainer_id: str):
    return await trainer_controller.get_trainer_clients(trainer_id)
