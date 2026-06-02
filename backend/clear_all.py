import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def clear_all():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print("Clearing database...")
    
    collections = await db.list_collection_names()
    for coll in collections:
        if coll != "users":
            await db[coll].delete_many({})
            print(f"Cleared {coll}")
    
    print("Database refreshed! Kept users intact.")

if __name__ == "__main__":
    asyncio.run(clear_all())
