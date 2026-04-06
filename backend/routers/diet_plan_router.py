from fastapi import APIRouter, Depends
from schemas.diet_plan import DietPlanCreateRequest
from schemas.common import MessageResponse
from controllers import diet_plan_controller
from middleware.auth import get_current_user, require_role

router = APIRouter(prefix="/diet-plans", tags=["Diet Plans"])


# ── GET trainer's diet plan templates ────────────────────────────
@router.get(
    "",
    summary="[Trainer] Get all diet plan templates created by me",
)
async def list_diet_plans(current_user: dict = Depends(require_role("trainer", "admin"))):
    return await diet_plan_controller.get_diet_plans_by_trainer(current_user["id"])


# ── GET single diet plan ──────────────────────────────────────────
@router.get(
    "/{plan_id}",
    summary="Get a single diet plan template",
    dependencies=[Depends(get_current_user)],
)
async def get_diet_plan(plan_id: str):
    return await diet_plan_controller.get_diet_plan_by_id(plan_id)


# ── POST create diet plan ─────────────────────────────────────────
@router.post(
    "",
    status_code=201,
    summary="[Trainer] Create a new diet plan template",
)
async def create_diet_plan(
    payload: DietPlanCreateRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    return await diet_plan_controller.create_diet_plan(current_user["id"], payload)


# ── PUT update diet plan ──────────────────────────────────────────
@router.put(
    "/{plan_id}",
    summary="[Trainer] Update a diet plan template",
)
async def update_diet_plan(
    plan_id: str,
    payload: DietPlanCreateRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    return await diet_plan_controller.update_diet_plan(
        current_user["id"], plan_id, payload
    )


# ── DELETE diet plan ──────────────────────────────────────────────
@router.delete(
    "/{plan_id}",
    response_model=MessageResponse,
    summary="[Trainer] Delete a diet plan template",
)
async def delete_diet_plan(
    plan_id: str,
    current_user: dict = Depends(require_role("trainer")),
):
    return await diet_plan_controller.delete_diet_plan(current_user["id"], plan_id)


# ── POST assign diet plan to client ──────────────────────────────
@router.post(
    "/{plan_id}/assign/{client_id}",
    summary="[Trainer] Assign this diet plan to a specific client",
)
async def assign_diet_plan(
    plan_id: str,
    client_id: str,
    current_user: dict = Depends(require_role("trainer")),
):
    return await diet_plan_controller.assign_diet_plan(
        current_user["id"], plan_id, client_id
    )
