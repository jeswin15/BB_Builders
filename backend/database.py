from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        try:
            print(f"Connecting to MongoDB at {settings.MONGODB_URI.split('@')[-1]}...")
            self.client = AsyncIOMotorClient(settings.MONGODB_URI, tlsAllowInvalidCertificates=True)
            self.db = self.client[settings.DATABASE_NAME]
            print(f"Connected to MongoDB Atlas: {settings.DATABASE_NAME}")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")

    def close(self):
        if self.client:
            self.client.close()

db_client = MongoDBClient()

async def get_db():
    if db_client.db is None:
        db_client.connect()
    return db_client.db

