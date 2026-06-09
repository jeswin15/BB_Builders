from database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from sqlalchemy import select, update, delete
from models.schema import Worker

router = APIRouter(prefix="/api/workers", tags=["workers"])

class WorkerAttendance(BaseModel):
    date: str
    status: str
    paid: bool = False
    wage: float = 0.0
    site: str = ""
    paidDate: Optional[str] = None

class WorkerModel(BaseModel):
    id: str
    name: str
    phone: str
    skill: str
    dailyRate: float
    joinDate: str
    status: str
    site: str
    advances: float
    balance: float
    attendance: List[WorkerAttendance]

@router.get("", response_model=List[WorkerModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Worker))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=WorkerModel)
def create_item(item: WorkerModel, db: Session = Depends(get_db)):
    db.add(Worker(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=WorkerModel)
def update_item(id: str, item: WorkerModel, db: Session = Depends(get_db)):
    db.execute(update(Worker).where(Worker.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Worker).where(Worker.id == id))
    db.commit()
    return {"status": "deleted"}
