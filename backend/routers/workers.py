from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import get_db

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
async def get_workers(db=Depends(get_db)):
    cursor = db["workers"].find()
    workers = await cursor.to_list(length=1000)
    for w in workers:
        w.pop('_id', None)
    return workers

@router.post("", response_model=WorkerModel)
async def create_worker(worker: WorkerModel, db=Depends(get_db)):
    await db["workers"].insert_one(worker.model_dump())
    return worker

@router.put("/{worker_id}", response_model=WorkerModel)
async def update_worker(worker_id: str, worker: WorkerModel, db=Depends(get_db)):
    await db["workers"].update_one({"id": worker_id}, {"$set": worker.model_dump()})
    return worker

@router.delete("/{worker_id}")
async def delete_worker(worker_id: str, db=Depends(get_db)):
    await db["workers"].delete_one({"id": worker_id})
    return {"status": "deleted"}
