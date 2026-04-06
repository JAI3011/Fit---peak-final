import os
from pymongo import MongoClient
from dotenv import load_dotenv

def check_highlights():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME", "Fit-peak")
    
    # Simple sync connection
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["highlights"]
    
    print(f"Connecting to DB: {db_name}...")
    highlights = list(collection.find({}))
    
    found = False
    for h in highlights:
        title = str(h.get("title", ""))
        url = str(h.get("youtube_url", ""))
        print(f"Title: {title} | URL: {url}")
        if "CALISTENICS AND WORKOUT 2020" in title.upper():
            print(f"\n>>> FOUND TARGET: {title}")
            print(f">>> youtube_url: {url}\n")
            found = True
    
    if not found:
        print("\nTarget highlight not found.")
    
    client.close()

if __name__ == "__main__":
    check_highlights()
