from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from schemas.session import SessionCreateRequest, SessionResponse
from controllers import session_controller
from middleware.auth import require_role

router = APIRouter(prefix="/trainer/sessions", tags=["Trainer Sessions"])

@router.get("", response_model=list[SessionResponse])
async def get_sessions(
    start_date: str,   # YYYY-MM-DD
    end_date: str,     # YYYY-MM-DD
    current_user: dict = Depends(require_role("trainer")),
):
    """Get all sessions for the trainer within a date range."""
    return await session_controller.get_sessions(
        trainer_id=current_user["id"],
        start_date=start_date,
        end_date=end_date,
    )

@router.post("", response_model=SessionResponse, status_code=201)
async def create_session(
    payload: SessionCreateRequest,
    current_user: dict = Depends(require_role("trainer")),
):
    """Create a new session."""
    return await session_controller.create_session(
        trainer_id=current_user["id"],
        payload=payload,
    )

@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    current_user: dict = Depends(require_role("trainer")),
):
    """Delete a session belonging to the trainer."""
    await session_controller.delete_session(
        trainer_id=current_user["id"],
        session_id=session_id,
    )
    return None