import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_user():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['Fit-peak']
    user = await db['users'].find_one({"email": "don@gmail.com"})
    print("USER EXISTS:", user is not None)
    if user:
        print("ROLE:", user.get("role"))
        print("STATUS:", user.get("status"))

if __name__ == '__main__':
    asyncio.run(check_user())
