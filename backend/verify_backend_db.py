import asyncio
from config.database import connect_db, get_database, settings
import os

async def verify():
    try:
        print(f"Checking environment...")
        print(f"MONGO_URI from settings: {settings.mongo_uri[:20]}...")
        print(f"DB_NAME from settings: {settings.mongo_db_name}")
        
        await connect_db()
        db = get_database()
        count = await db["users"].count_documents({})
        print(f"SUCCESS: Found {count} users in the database.")
        
        # Check specific user
        user = await db["users"].find_one({"email": "admin@fitpeak.com"})
        if user:
            print("SUCCESS: admin@fitpeak.com exists.")
        else:
            print("FAILURE: admin@fitpeak.com does not exist in this database!")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
