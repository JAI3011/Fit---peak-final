from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.highlight import HighlightCreateRequest, HighlightUpdateRequest, HighlightResponse
from controllers import highlight_controller
from middleware.auth import require_role

router = APIRouter(prefix="/highlights", tags=["Fitness Highlights"])

# Public endpoints
@router.get("", response_model=List[HighlightResponse])
async def get_all_highlights():
    return await highlight_controller.get_all_highlights()

@router.get("/{highlight_id}", response_model=HighlightResponse)
async def get_highlight(highlight_id: str):
    return await highlight_controller.get_highlight(highlight_id)

# Admin-only endpoints
@router.post("", response_model=HighlightResponse, status_code=201)
async def create_highlight(
    payload: HighlightCreateRequest,
    current_user: dict = Depends(require_role("admin")),
):
    return await highlight_controller.create_highlight(payload)

@router.put("/{highlight_id}", response_model=HighlightResponse)
async def update_highlight(
    highlight_id: str,
    payload: HighlightUpdateRequest,
    current_user: dict = Depends(require_role("admin")),
):
    return await highlight_controller.update_highlight(highlight_id, payload)

@router.delete("/{highlight_id}", status_code=204)
async def delete_highlight(
    highlight_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    await highlight_controller.delete_highlight(highlight_id)