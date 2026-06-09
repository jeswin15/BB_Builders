from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from models.schema import Project

router = APIRouter(prefix="/api/projects", tags=["projects"])

class ProjectModel(BaseModel):
    id: str
    name: str
    client: str
    budget: float
    timeline: str
    location: str
    status: str

@router.get("", response_model=List[ProjectModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Project))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=ProjectModel)
def create_item(item: ProjectModel, db: Session = Depends(get_db)):
    db.add(Project(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=ProjectModel)
def update_item(id: str, item: ProjectModel, db: Session = Depends(get_db)):
    db.execute(update(Project).where(Project.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Project).where(Project.id == id))
    db.commit()
    return {"status": "deleted"}
