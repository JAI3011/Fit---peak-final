# FitPeak Backend API

FastAPI + MongoDB backend for the **FitPeak** fitness SaaS platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Database | MongoDB (Motor async driver) |
| Auth | JWT via `python-jose` + `passlib[bcrypt]` |
| Validation | Pydantic v2 |
| Server | Uvicorn (ASGI) |

---

## Project Structure

```
fitpeak-backend/
├── main.py                    # App factory, router registration, lifespan
├── seed_db.py                 # Development data seeder
├── requirements.txt
├── .env.example
│
├── config/
│   ├── settings.py            # Pydantic-settings (reads .env)
│   └── database.py            # Motor async connection pool
│
├── routers/                   # Thin route handlers — just wire HTTP ↔ controller
│   ├── auth_router.py         # POST /auth/register, POST /auth/login
│   ├── user_router.py         # CRUD /users, assign plans
│   ├── trainer_router.py      # Admin trainer management
│   ├── workout_router.py      # Trainer workout templates + assign
│   ├── diet_plan_router.py    # Trainer diet templates + assign
│   ├── feedback_router.py     # Submit / list / delete feedback
│   ├── analytics_router.py    # Admin charts data
│   ├── settings_router.py     # System settings
│   └── dashboard_router.py    # GET /dashboard (current user)
│
├── controllers/               # Business logic — all DB access lives here
│   ├── auth_controller.py
│   ├── user_controller.py
│   ├── trainer_controller.py
│   ├── workout_controller.py
│   ├── diet_plan_controller.py
│   ├── feedback_controller.py
│   ├── analytics_controller.py
│   ├── settings_controller.py
│   └── dashboard_controller.py
│
├── schemas/                   # Pydantic request/response models
│   ├── auth.py
│   ├── user.py
│   ├── workout.py
│   ├── diet_plan.py
│   ├── feedback.py
│   ├── trainer.py
│   └── common.py
│
├── models/
│   └── collections.py         # MongoDB schema documentation (reference)
│
├── middleware/
│   └── auth.py                # JWT dependency + require_role() factory
│
└── utils/
    ├── security.py            # hash_password, verify_password, JWT helpers
    └── helpers.py             # doc_to_dict, utc_now_str, today_date_str
```

---

## Quick Start

### 1 — Prerequisites

- Python 3.11+
- MongoDB 6+ running on `localhost:27017` (or supply a remote URI)

### 2 — Install dependencies

```bash
cd fitpeak-backend
python -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### 3 — Configure environment

```bash
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET_KEY at minimum
```

### 4 — Seed development data (optional but recommended)

```bash
python seed_db.py
```

This creates three ready-to-use accounts:

| Email | Password | Role |
|---|---|---|
| admin@fitpeak.com | Admin@123 | admin |
| trainer@fitpeak.com | Trainer@123 | trainer |
| user@fitpeak.com | User@123 | user |

### 5 — Run the server

```bash
uvicorn main:app --reload --port 8000
```

For Windows, use the project venv explicitly to avoid interpreter mismatches:

```powershell
C:\Users\hp\OneDrive\Desktop\Project\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

In VS Code you can also run the task: `Run Backend (venv)`.

- Swagger UI → http://localhost:8000/docs
- ReDoc → http://localhost:8000/redoc
- Health check → http://localhost:8000/health

---

## API Reference

All routes are prefixed with `/api/v1`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Create account, receive JWT |
| POST | `/auth/login` | ✗ | Login, receive JWT |

### Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | ✓ any | Current user full profile + trainer name |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | admin | All platform users |
| GET | `/users/clients` | trainer/admin | All role=user accounts |
| GET | `/users/my-clients` | trainer | Clients assigned to me |
| GET | `/users/{id}` | ✓ | Single user (own or admin/trainer) |
| PUT | `/users/{id}` | ✓ | Update profile |
| PUT | `/users/{id}/admin-edit` | admin | Change role/status/trainer |
| PUT | `/users/{id}/toggle-status` | admin | Activate / deactivate |
| DELETE | `/users/{id}` | admin | Remove user |
| POST | `/users/{id}/assign-workout` | trainer/admin | Assign workout snapshot |
| POST | `/users/{id}/assign-diet` | trainer/admin | Assign diet snapshot |

### Trainers

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/trainers` | admin | All trainers |
| POST | `/trainers` | admin | Add new trainer |
| PUT | `/trainers/{id}/approve` | admin | Set status → active |
| PUT | `/trainers/{id}/reject` | admin | Set status → inactive |
| GET | `/trainers/{id}/clients` | admin/trainer | Clients of a trainer |

### Workouts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/workouts` | trainer/admin | My workout templates |
| GET | `/workouts/{id}` | ✓ | Single workout |
| POST | `/workouts` | trainer | Create template |
| PUT | `/workouts/{id}` | trainer | Update template |
| DELETE | `/workouts/{id}` | trainer | Delete template |
| POST | `/workouts/{id}/assign/{clientId}` | trainer | Assign to client |

### Diet Plans

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/diet-plans` | trainer/admin | My diet templates |
| GET | `/diet-plans/{id}` | ✓ | Single diet plan |
| POST | `/diet-plans` | trainer | Create template |
| PUT | `/diet-plans/{id}` | trainer | Update template |
| DELETE | `/diet-plans/{id}` | trainer | Delete template |
| POST | `/diet-plans/{id}/assign/{clientId}` | trainer | Assign to client |

### Feedback

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/feedback` | admin | All feedback entries |
| POST | `/feedback` | ✓ | Submit feedback |
| DELETE | `/feedback/{id}` | admin | Delete feedback |

### Analytics

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/analytics/summary` | admin | Total users, trainers, active |
| GET | `/analytics/user-growth` | admin | Monthly signups (6 months) |
| GET | `/analytics/active-users` | admin | Daily active users (7 days) |
| GET | `/analytics/workout-logs` | admin | Daily workout logs (7 days) |

### Settings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/settings` | admin | Get system config |
| PUT | `/settings` | admin | Update system config |

---

## Frontend Integration

Update your frontend `api.js` base URL:

```js
// src/api.js
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  ...
})
```

The JWT interceptor in `api.js` already reads from `localStorage` under key  
`fitpeak-token` and attaches `Authorization: Bearer <token>` — this matches  
the backend `HTTPBearer` dependency exactly.

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | All accounts (user / trainer / admin) |
| `workouts` | Trainer-created workout templates |
| `diet_plans` | Trainer-created diet templates |
| `feedback` | User-submitted feedback |
| `settings` | Single-document system configuration |

See `models/collections.py` for full field documentation.

---

## Security Notes

- Passwords hashed with **bcrypt** (12 rounds via passlib)
- JWT tokens expire after **24 hours** (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- CORS origins are **whitelist-only** — set `ALLOWED_ORIGINS` in `.env`
- All admin endpoints enforce role via `require_role("admin")` dependency
- Trainer endpoints enforce `require_role("trainer")` — trainers cannot touch other trainers' data
- MongoDB indexes on `email` (unique), `role`, `trainer_id` prevent duplicates and ensure fast queries

---

## Production Checklist

- [ ] Set a strong random `JWT_SECRET_KEY` (32+ chars)
- [ ] Point `MONGO_URI` to your Atlas / hosted MongoDB cluster
- [ ] Set `ENVIRONMENT=production` and `DEBUG=False`
- [ ] Update `ALLOWED_ORIGINS` to your production frontend domain
- [ ] Use a process manager (e.g. `gunicorn` with `uvicorn` workers)
- [ ] Put an Nginx reverse-proxy in front
- [ ] Enable MongoDB authentication and TLS
