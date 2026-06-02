import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def clear_db():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print("Clearing database...")
    
    await db["sites"].delete_many({})
    print("Cleared sites")
    
    await db["workers"].delete_many({})
    print("Cleared workers")
    
    await db["transactions"].delete_many({})
    print("Cleared transactions")
    
    await db["invoices"].delete_many({})
    print("Cleared invoices")
    
    await db["fs.files"].delete_many({})
    await db["fs.chunks"].delete_many({})
    print("Cleared GridFS documents")
    
    print("Database refreshed! Kept users intact.")

if __name__ == "__main__":
    asyncio.run(clear_db())
