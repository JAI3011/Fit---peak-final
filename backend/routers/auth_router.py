from fastapi import APIRouter, Depends
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AdminCreateRequest, RequestOTPRequest, VerifyOTPAndResetRequest
from controllers import auth_controller
from middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    summary="Register a new user / trainer / admin",
)
async def register(payload: RegisterRequest):
    """
    Creates a new account and returns a JWT token immediately.

    - **role**: `user` | `trainer` | `admin`
    - Trainers are created with `status = pending` until approved by admin.
    """
    return await auth_controller.register_user(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT token",
)
async def login(payload: LoginRequest):
    """
    Authenticates credentials and returns a Bearer token.

    - **role** must match the account's registered role.
    """
    return await auth_controller.login_user(payload)


@router.post(
    "/admin/create",
    response_model=TokenResponse,
    status_code=201,
    summary="Create an admin account",
)
async def create_admin(payload: AdminCreateRequest):
    """
    Create a new admin account.
    
    Access Control:
    - If NO admin exists in system ALLOW (setup mode for first admin)
    - If admin(s) already exist DENY (prevent unauthorized admin creation)
    
    First Admin Setup:
    POST /api/v1/auth/admin/create
    {
      "name": "Super Admin",
      "email": "admin@fitpeak.com",
      "password": "SecurePassword123"
    }
    """
    return await auth_controller.create_admin_account(payload)


@router.post(
    "/request-otp",
    summary="Request a password reset OTP",
    status_code=200,
)
async def request_otp(payload: RequestOTPRequest):
    """
    Sends a 6-digit OTP to the user's email if the email exists in the system.
    """
    return await auth_controller.request_otp(payload)


@router.post(
    "/verify-otp-and-reset",
    summary="Verify OTP and reset password",
    status_code=200,
)
async def verify_otp_and_reset(payload: VerifyOTPAndResetRequest):
    """
    Verifies the OTP and sets a new password in one step.
    """
    return await auth_controller.verify_otp_and_reset(payload)


@router.get(
    "/me",
    summary="Get current authenticated user profile",
)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password_hash"}
