"""Quick script to debug login issues."""
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

async def main():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "Fit-peak")
    print(f"Connecting to: {uri[:40]}...")
    print(f"Database: {db_name}")
    
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    
    try:
        await client.admin.command("ping")
        print("MongoDB connection: OK")
    except Exception as e:
        print(f"MongoDB connection FAILED: {e}")
        return
    
    db = client[db_name]
    
    # Check users collection
    count = await db["users"].count_documents({})
    print(f"\nTotal users in DB: {count}")
    
    if count == 0:
        print("\n*** DATABASE IS EMPTY! Run: python seed_db.py ***")
        return
    
    # List all users
    users = await db["users"].find({}, {"email": 1, "role": 1, "status": 1, "password_hash": 1}).to_list(20)
    print("\nUsers found:")
    for u in users:
        has_hash = bool(u.get("password_hash"))
        hash_prefix = u.get("password_hash", "")[:15] if has_hash else "MISSING"
        print(f"  email={u['email']}  role={u['role']}  status={u.get('status','?')}  hash={hash_prefix}...")
    
    # Test password verification for seed user
    print("\n--- Password verification test ---")
    from utils.security import verify_password
    
    test_user = await db["users"].find_one({"email": "user@fitpeak.com"})
    if test_user:
        result = verify_password("User@123", test_user.get("password_hash", ""))
        print(f"user@fitpeak.com + 'User@123' => {result}")
    else:
        print("user@fitpeak.com NOT FOUND in DB")
    
    test_admin = await db["users"].find_one({"email": "admin@fitpeak.com"})
    if test_admin:
        result = verify_password("Admin@123", test_admin.get("password_hash", ""))
        print(f"admin@fitpeak.com + 'Admin@123' => {result}")
    else:
        print("admin@fitpeak.com NOT FOUND in DB")
    
    client.close()

asyncio.run(main())
