import os
from pymongo import MongoClient
from dotenv import load_dotenv

def fix_highlight_url():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME", "Fit-peak")
    
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["highlights"]
    
    # Target title
    target_title = " CALISTENICS AND WORKOUT 2020"
    
    print(f"Searching for highlight with title: '{target_title}'")
    doc = collection.find_one({"title": target_title})
    
    if not doc:
        # Try without leading space just in case
        target_title = "CALISTENICS AND WORKOUT 2020"
        doc = collection.find_one({"title": target_title})
    
    if doc:
        old_url = doc.get("youtube_url")
        if "?si=" in old_url:
            new_url = old_url.split("?si=")[0]
            print(f"Found! Title: {doc['title']}")
            print(f"Old URL: {old_url}")
            print(f"New URL: {new_url}")
            
            result = collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"youtube_url": new_url}}
            )
            
            if result.modified_count > 0:
                print("Successfully updated the database entry.")
            else:
                print("No changes made (perhaps URL was already clean).")
        else:
            print(f"URL already looks clean: {old_url}")
    else:
        print("Target highlight not found in database.")
    
    client.close()

if __name__ == "__main__":
    fix_highlight_url()
