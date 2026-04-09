import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config.database import get_database
from utils.security import decode_access_token
from utils.helpers import doc_to_dict

bearer_scheme = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    # ✅ FIXED: call get_database() directly — it's a sync factory, not an async dep
    logger.debug("get_current_user called")
    if credentials is None:
        logger.info("No credentials provided for authenticated request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(credentials.credentials)
        logger.debug("Token decoded successfully")
    except ValueError as e:
        logger.info("Token decode failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        logger.info("Token payload missing subject claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bad token payload"
        )

    from bson import ObjectId

    # ✅ FIXED: get_database() called directly, not injected via Depends
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        logger.info("Authenticated user not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    logger.debug("User authenticated: role=%s", user.get("role"))
    return doc_to_dict(user)


def require_role(*roles: str):
    """Factory: returns a dependency that asserts the current user has one of *roles*."""

    async def _check(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role(s): {', '.join(roles)}",
            )
        return current_user

    return _check
