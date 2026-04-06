import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_highlights():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME", "Fit-peak")
    
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    collection = db["highlights"]
    
    print(f"Connecting to DB: {db_name}...")
    highlights = await collection.find({}).to_list(length=100)
    
    found = False
    for h in highlights:
        title = h.get("title", "")
        url = h.get("youtube_url", "")
        print(f"Title: {title} | URL: {url}")
        if "CALISTENICS AND WORKOUT 2020" in title.upper():
            print(f"\n>>> FOUND TARGET: {title}")
            print(f">>> youtube_url: {url}\n")
            found = True
    
    if not found:
        print("\nTarget highlight not found in the first 100 entries.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_highlights())
