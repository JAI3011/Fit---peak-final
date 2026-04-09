from fastapi import APIRouter, Depends, HTTPException
from schemas.user import UserUpdateRequest, AdminUserEditRequest, ChangePasswordRequest
from schemas.common import MessageResponse
from controllers import user_controller
from middleware.auth import get_current_user, require_role
from utils.security import verify_password, hash_password
from config.database import get_database

router = APIRouter(prefix="/users", tags=["Users"])

# ── Admin-only: list ALL users ────────────────────────────────────
@router.get(
    "",
    summary="[Admin] Get all platform users",
    dependencies=[Depends(require_role("admin"))],
)
async def list_all_users():
    return await user_controller.get_all_users()


# ── Trainer: list only role=user ──────────────────────────────────
@router.get(
    "/clients",
    summary="[Trainer] Get all regular users (potential clients)",
    dependencies=[Depends(require_role("trainer", "admin"))],
)
async def list_users_only():
    return await user_controller.get_users_only()


# ── Trainer: get MY assigned clients ─────────────────────────────
@router.get(
    "/my-clients",
    summary="[Trainer] Get clients assigned to the current trainer",
)
async def my_clients(current_user: dict = Depends(require_role("trainer"))):
    return await user_controller.get_clients_for_trainer(current_user["id"])


# ── GET single user by id ─────────────────────────────────────────
@router.get(
    "/{user_id}",
    summary="Get user by ID",
)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    # Fetch the target user first
    user = await user_controller.get_user_by_id(user_id)
    
    # 1. Regular users can ONLY access their own profile
    if current_user["role"] == "user" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # 2. Trainers can ONLY access their assigned clients or themselves
    if current_user["role"] == "trainer":
        if user.get("trainer_id") != current_user["id"] and current_user["id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    # Admins have full access to everything else
    return user


# ── PUT update own profile ────────────────────────────────────────
@router.put(
    "/{user_id}",
    summary="Update user profile (own profile or admin)",
)
async def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    # Standard users and trainers can only update THEIR OWN profile
    if current_user["role"] in ["user", "trainer"] and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    update_data = payload.model_dump(exclude_none=True)
    if current_user["role"] != "admin":
        update_data.pop("role", None)
        update_data.pop("status", None)

    return await user_controller.update_user_profile(user_id, update_data)


# ── PUT admin edit ────────────────────────────────────────────────
@router.put(
    "/{user_id}/admin-edit",
    summary="[Admin] Edit any user's role / status / trainer",
    dependencies=[Depends(require_role("admin"))],
)
async def admin_edit_user(user_id: str, payload: AdminUserEditRequest):
    return await user_controller.admin_update_user(user_id, payload)


# ── PUT toggle status ─────────────────────────────────────────────
@router.put(
    "/{user_id}/toggle-status",
    summary="[Admin] Toggle user active / inactive",
    dependencies=[Depends(require_role("admin"))],
)
async def toggle_status(user_id: str):
    return await user_controller.toggle_user_status(user_id)


# ── DELETE user ───────────────────────────────────────────────────
@router.delete(
    "/{user_id}",
    response_model=MessageResponse,
    summary="[Admin] Delete a user",
    dependencies=[Depends(require_role("admin"))],
)
async def remove_user(user_id: str):
    return await user_controller.delete_user(user_id)


# ── POST assign workout to client ─────────────────────────────────
@router.post(
    "/{client_id}/assign-workout",
    summary="[Trainer] Assign a workout plan to a client",
    dependencies=[Depends(require_role("trainer", "admin"))],
)
async def assign_workout(
    client_id: str,
    plan: dict,
    current_user: dict = Depends(get_current_user),
):
    client = await user_controller.get_user_by_id(client_id)
    if current_user["role"] == "trainer" and (
        client.get("role") != "user" or client.get("trainer_id") != current_user["id"]
    ):
        raise HTTPException(status_code=403, detail="This client is not assigned to you")
    return await user_controller.assign_workout_to_client(client_id, plan)


# ── POST assign diet to client ────────────────────────────────────
@router.post(
    "/{client_id}/assign-diet",
    summary="[Trainer] Assign a diet plan to a client",
    dependencies=[Depends(require_role("trainer", "admin"))],
)
async def assign_diet(
    client_id: str,
    plan: dict,
    current_user: dict = Depends(get_current_user),
):
    client = await user_controller.get_user_by_id(client_id)
    if current_user["role"] == "trainer" and (
        client.get("role") != "user" or client.get("trainer_id") != current_user["id"]
    ):
        raise HTTPException(status_code=403, detail="This client is not assigned to you")
    return await user_controller.assign_diet_to_client(client_id, plan)

# ── POST skip workout ────────────────────────────────────────────────
@router.post(
    "/{user_id}/skip-workout",
    summary="Skip today's workout",
)
async def skip_workout(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Mark today's workout as skipped.
    Users can skip their own workout; trainers and admins can skip for any client.
    """
    # Access control: allow the user themselves, or trainer/admin
    if current_user["id"] != user_id and current_user["role"] not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return await user_controller.skip_workout(user_id)

# ── POST create user (admin only) ──────────────────────────────────
@router.post(
    "/admin/users",
    status_code=201,
    summary="[Admin] Create a new user (user, trainer, or admin)",
    dependencies=[Depends(require_role("admin"))],
)
async def create_user_by_admin(payload: dict):
    """
    Create a new user account with a default password.
    Required fields in payload:
    - name: string
    - email: string
    - role: 'user' | 'trainer' | 'admin'
    - status: 'active' | 'inactive' | 'pending' (optional, default 'active')
    - trainer_id: optional (ObjectId of a trainer to assign)
    """
    return await user_controller.create_user_by_admin(payload)
# ── PUT change own password ───────────────────────────────────────
@router.put(
    "/{user_id}/change-password",
    summary="Change own password",
)
async def change_password(
    user_id: str,
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db = get_database()
    from utils.helpers import validate_object_id
    user_doc = await db["users"].find_one({"_id": validate_object_id(user_id)})

    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_hash = hash_password(payload.new_password)
    await db["users"].update_one(
        {"_id": validate_object_id(user_id)},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password updated successfully"}


# ── POST create admin (admin-only) ────────────────────────────────
@router.post(
    "/admin",
    summary="[Admin] Create a new admin account",
    dependencies=[Depends(require_role("admin"))],
)
async def create_admin_user(payload: dict):
    """
    Admin-only endpoint to create additional admin accounts.
    
    Required fields in payload:
    - name: Admin name
    - email: Admin email  
    - password: Admin password (min 6 chars)
    """
    from schemas.auth import AdminCreateRequest
    from utils.helpers import doc_to_dict, utc_now_str, today_date_str
    
    admin_payload = AdminCreateRequest(**payload)
    db = get_database()
    
    # Check email not already registered
    existing = await db["users"].find_one({"email": admin_payload.email})
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )
    
    # Create the admin account
    doc = {
        "name": admin_payload.name,
        "email": admin_payload.email,
        "password_hash": hash_password(admin_payload.password),
        "role": "admin",
        "status": "active",
        "joined": today_date_str(),
        "created_at": utc_now_str(),
        "calories_goal": 2400,
        "calories_consumed": 0,
        "overall_progress": 0,
        "macros": {"protein": 0, "carbs": 0, "fats": 0},
        "trainer_id": None,
        "assigned_workout": None,
        "assigned_diet": None,
        "progress_data": [],
    }
    
    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id
    user = doc_to_dict(doc)
    
    return {"message": f"Admin '{user['name']}' created successfully", "user": {k: v for k, v in user.items() if k != "password_hash"}}
