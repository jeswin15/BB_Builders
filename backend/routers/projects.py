from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])

class ProjectModel(BaseModel):
    id: str
    name: str
    client: str
    budget: float
    timeline: str
    location: str
    status: str

@router.get("/", response_model=List[ProjectModel])
async def get_projects(db=Depends(get_db)):
    cursor = db["projects"].find()
    projects = await cursor.to_list(length=1000)
    # MongoDB returns _id, remove it or map it
    for p in projects:
        p.pop('_id', None)
    return projects

@router.post("/", response_model=ProjectModel)
async def create_project(project: ProjectModel, db=Depends(get_db)):
    await db["projects"].insert_one(project.model_dump())
    return project

@router.put("/{project_id}", response_model=ProjectModel)
async def update_project(project_id: str, project: ProjectModel, db=Depends(get_db)):
    await db["projects"].update_one({"id": project_id}, {"$set": project.model_dump()})
    return project

@router.delete("/{project_id}")
async def delete_project(project_id: str, db=Depends(get_db)):
    await db["projects"].delete_one({"id": project_id})
    return {"status": "deleted"}
