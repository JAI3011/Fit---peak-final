"""
End-to-end test: Admin creates trainer → Trainer logs in with that password.
This simulates exactly what happens through the frontend.
"""
import asyncio
import pytest
from config.database import connect_db, get_database
from utils.security import hash_password, verify_password
from controllers.trainer_controller import add_trainer
from controllers.auth_controller import login_user
from schemas.trainer import AddTrainerRequest
from schemas.auth import LoginRequest


@pytest.mark.asyncio
async def test_flow():
    await connect_db()
    db = get_database()

    # ── Step 1: Admin creates a trainer with a specific password ──
    test_email = "newtrainer_test@fitpeak.com"
    test_password = "MySecret@99"

    # Clean up any previous test data
    await db["users"].delete_one({"email": test_email})

    print("=" * 60)
    print("STEP 1: Admin creates trainer")
    print(f"  Email:    {test_email}")
    print(f"  Password: {test_password}")

    payload = AddTrainerRequest(
        name="Test Trainer",
        email=test_email,
        password=test_password,
        specialization="Cardio",
        experience="2 years",
        certification="ACE",
        status="active",
    )

    result = await add_trainer(payload)
    print(f"  [OK] Trainer created! ID: {result.get('id')}")

    # -- Step 2: Verify the password was stored correctly --
    print("\nSTEP 2: Verify password in DB")
    user_doc = await db["users"].find_one({"email": test_email})
    stored_hash = user_doc.get("password_hash", "")
    match = verify_password(test_password, stored_hash)
    print(f"  Password verify_password('{test_password}', hash) => {match}")

    if not match:
        print("  [FAIL] Password was NOT stored correctly!")
        return

    print("  [OK] Password stored correctly!")

    # -- Step 3: Trainer logs in with that same password --
    print("\nSTEP 3: Trainer logs in")
    try:
        login_payload = LoginRequest(
            email=test_email,
            password=test_password,
            role="trainer",
        )
        login_result = await login_user(login_payload)
        token = login_result.get("access_token")
        print(f"  [OK] LOGIN SUCCESS! Token: {token[:30]}...")
    except Exception as e:
        print(f"  [FAIL] LOGIN FAILED: {e}")

    # -- Cleanup --
    await db["users"].delete_one({"email": test_email})
    print("\n[OK] Test data cleaned up.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_flow())
