import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from config import settings

async def wipe_collections():
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where())
    db = client[settings.DATABASE_NAME]
    
    collections = await db.list_collection_names()
    
    print(f"Found collections: {collections}")
    
    # Collections we want to preserve
    preserve = ["users"]
    
    for coll in collections:
        if coll not in preserve:
            print(f"Dropping collection: {coll}...")
            await db.drop_collection(coll)
            
    print("Database wiped successfully. Only 'users' collection remains.")
    client.close()

if __name__ == "__main__":
    asyncio.run(wipe_collections())
