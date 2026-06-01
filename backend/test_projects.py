import asyncio
from database import db_client
async def check_db():
    db_client.connect()
    projects = await db_client.db.projects.find().to_list(100)
    print("PROJECTS: ", len(projects))
    print(projects)
asyncio.run(check_db())
