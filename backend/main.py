from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from config.database import connect_db, close_db
from config.settings import get_settings
from config.rate_limit import limiter

# ── Routers ───────────────────────────────────────────────────────
from routers.auth_router import router as auth_router
from routers.user_router import router as user_router
from routers.trainer_router import router as trainer_router
from routers.workout_router import router as workout_router
from routers.diet_plan_router import router as diet_plan_router
from routers.feedback_router import router as feedback_router
from routers.analytics_router import router as analytics_router
from routers.settings_router import router as settings_router
from routers.dashboard_router import router as dashboard_router
from routers.session_router import router as session_router
from routers.task_router import router as task_router
from routers.workout_log_router import router as workout_log_router
from routers.diet_log_router import router as diet_log_router
from routers.highlight_router import router as highlight_router

settings = get_settings()
logger = logging.getLogger(__name__)


import asyncio

# ── Lifespan (startup / shutdown) ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await _ensure_indexes()
    try:
        yield
    except asyncio.CancelledError:
        pass
    finally:
        await close_db()


async def _ensure_indexes():
    """Create MongoDB indexes on startup for performance."""
    from config.database import get_database
    db = get_database()

    # users collection
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("role")
    await db["users"].create_index("trainer_id")
    await db["users"].create_index("status")

    # workouts collection
    await db["workouts"].create_index("trainer_id")

    # diet_plans collection
    await db["diet_plans"].create_index("trainer_id")

    # feedback collection
    await db["feedback"].create_index("user_id")
    await db["feedback"].create_index([("date", -1)])

    # sessions collection
    await db["sessions"].create_index([("trainer_id", 1), ("date", 1)])

    # otp_codes collection
    await db["otp_codes"].create_index("expires_at", expireAfterSeconds=0)

    print("[DB] MongoDB indexes ensured ✓")


# ── App factory ───────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "## FitPeak REST API\n\n"
        "Backend for the FitPeak fitness SaaS platform.\n\n"
        "### Roles\n"
        "- **user** – regular fitness member\n"
        "- **trainer** – certified trainer managing clients\n"
        "- **admin** – platform administrator\n\n"
        "### Auth\n"
        "All protected routes require `Authorization: Bearer <token>`."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ──────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ── Register all routers under /api/v1 ────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth_router,      prefix=PREFIX)
app.include_router(user_router,      prefix=PREFIX)
app.include_router(trainer_router,   prefix=PREFIX)
app.include_router(workout_router,   prefix=PREFIX)
app.include_router(diet_plan_router, prefix=PREFIX)
app.include_router(feedback_router,  prefix=PREFIX)
app.include_router(analytics_router, prefix=PREFIX)
app.include_router(settings_router,  prefix=PREFIX)
app.include_router(dashboard_router, prefix=PREFIX)
app.include_router(session_router,   prefix=PREFIX)
app.include_router(task_router,      prefix=PREFIX)
app.include_router(workout_log_router, prefix=PREFIX)
app.include_router(diet_log_router,    prefix=PREFIX)
app.include_router(highlight_router,   prefix=PREFIX)

# ── Health check ──────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name} API",
        "docs": "/docs",
        "health": "/health",
    }
