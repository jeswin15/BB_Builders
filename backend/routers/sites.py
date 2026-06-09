from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from models.schema import Site
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/sites", tags=["sites"])

class SiteModel(BaseModel):
    id: str
    name: str
    project: str
    location: str
    engineers: int
    workers: int
    status: str

@router.get("", response_model=List[SiteModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Site))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=SiteModel)
def create_item(item: SiteModel, db: Session = Depends(get_db)):
    db.add(Site(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=SiteModel)
def update_item(id: str, item: SiteModel, db: Session = Depends(get_db)):
    db.execute(update(Site).where(Site.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Site).where(Site.id == id))
    db.commit()
    return {"status": "deleted"}
