from database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from models.user import UserInDB, Role
from models.hr import (
    WorkerCreate, WorkerInDB, WorkerStatus,
    AttendanceCreate, AttendanceInDB, AttendanceStatus
)
from routers.auth import require_role
import uuid
from database import local_db
from typing import List

router = APIRouter(prefix="/hr", tags=["hr"])

# Initialize storage for MVP
if "workers" not in local_db: local_db["workers"] = {}
if "attendance" not in local_db: local_db["attendance"] = {}

# --- Workers ---
@router.post("/workers", response_model=WorkerInDB)
async def create_worker(worker: WorkerCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    worker_id = str(uuid.uuid4())
    db_worker = WorkerInDB(**worker.model_dump(), id=worker_id)
    local_db["workers"][worker_id] = db_worker
    return db_worker

@router.get("", response_model=List[HRModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(HRStaff))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=HRModel)
def create_item(item: HRModel, db: Session = Depends(get_db)):
    db.add(HRStaff(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=HRModel)
def update_item(id: str, item: HRModel, db: Session = Depends(get_db)):
    db.execute(update(HRStaff).where(HRStaff.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(HRStaff).where(HRStaff.id == id))
    db.commit()
    return {"status": "deleted"}
