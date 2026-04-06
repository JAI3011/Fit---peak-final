import asyncio
from config.database import connect_db, get_database
from utils.security import verify_password
import os

async def verify_trainer():
    try:
        await connect_db()
        db = get_database()
        
        test_email = "trainer@fitpeak.com"
        test_password = "Trainer@123"
        
        user = await db["users"].find_one({"email": test_email})
        if not user:
            print(f"FAILURE: User '{test_email}' not found in DB.")
            return

        print(f"SUCCESS: User '{test_email}' found.")
        print(f"Role: {user.get('role')}")
        print(f"Status: {user.get('status')}")
        
        # Test password
        is_match = verify_password(test_password, user.get("password_hash", ""))
        if is_match:
            print(f"SUCCESS: Password '{test_password}' matches.")
        else:
            print(f"FAILURE: Password '{test_password}' does not match.")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(verify_trainer())
