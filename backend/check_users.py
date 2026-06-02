import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def check_users():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    users = await db["users"].find().to_list(100)
    for u in users:
        print(f"Email: {u.get('email')} | Role: {u.get('role')} | Password: {u.get('password')}")

if __name__ == "__main__":
    asyncio.run(check_users())
