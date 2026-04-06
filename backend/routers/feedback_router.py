from fastapi import APIRouter, Depends
from schemas.feedback import FeedbackCreateRequest
from schemas.common import MessageResponse
from controllers import feedback_controller
from middleware.auth import get_current_user, require_role

router = APIRouter(prefix="/feedback", tags=["Feedback"])


# ── GET all feedback (admin only) ─────────────────────────────────
@router.get(
    "",
    summary="[Admin] Get all submitted feedback",
    dependencies=[Depends(require_role("admin"))],
)
async def list_feedback():
    return await feedback_controller.get_all_feedback()


# ── POST submit feedback ──────────────────────────────────────────
@router.post(
    "",
    status_code=201,
    summary="Submit feedback (authenticated users & trainers)",
)
async def submit_feedback(
    payload: FeedbackCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    return await feedback_controller.create_feedback(current_user, payload)


# ── DELETE feedback (admin) ───────────────────────────────────────
@router.delete(
    "/{feedback_id}",
    response_model=MessageResponse,
    summary="[Admin] Delete a feedback entry",
    dependencies=[Depends(require_role("admin"))],
)
async def remove_feedback(feedback_id: str):
    return await feedback_controller.delete_feedback(feedback_id)

@router.get(
    "/public",
    summary="Public testimonials (no authentication required)",
    tags=["Feedback"],
)
async def get_public_feedback():
    """
    Returns a list of feedback entries suitable for public display.
    Excludes user_email and user_id. Returns up to 10 most recent.
    """
    return await feedback_controller.get_public_feedback()