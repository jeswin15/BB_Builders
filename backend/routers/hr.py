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

@router.get("/workers", response_model=List[WorkerInDB])
async def get_workers(user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER, Role.WORKER]))):
    # If the user is a worker, they should only see their own profile
    if user.role == Role.WORKER:
        return [w for w in local_db["workers"].values() if w.user_account_id == user.id]
    
    # If site manager, ideally only see workers assigned to their site (simplified here)
    return list(local_db["workers"].values())

# --- Attendance ---
@router.post("/attendance", response_model=AttendanceInDB)
async def log_attendance(attendance: AttendanceCreate, user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER]))):
    # Verify worker exists
    worker = local_db["workers"].get(attendance.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    # Calculate daily wage based on attendance status
    calculated_wage = 0.0
    if attendance.status == AttendanceStatus.PRESENT:
        calculated_wage = worker.daily_wage + (attendance.overtime_hours * worker.overtime_rate)
    elif attendance.status == AttendanceStatus.HALF_DAY:
        calculated_wage = (worker.daily_wage / 2) + (attendance.overtime_hours * worker.overtime_rate)
    elif attendance.status == AttendanceStatus.HOLIDAY:
        # Assuming paid holidays for active workers
        calculated_wage = worker.daily_wage
        
    attendance_id = str(uuid.uuid4())
    db_attendance = AttendanceInDB(
        **attendance.model_dump(exclude={'calculated_daily_wage'}), 
        id=attendance_id,
        calculated_daily_wage=calculated_wage
    )
    local_db["attendance"][attendance_id] = db_attendance
    return db_attendance

@router.get("/attendance", response_model=List[AttendanceInDB])
async def get_attendance(worker_id: str = None, user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER, Role.WORKER]))):
    records = list(local_db["attendance"].values())
    
    # Workers can only see their own attendance
    if user.role == Role.WORKER:
        # Find the worker profile linked to this user account
        worker_profile = next((w for w in local_db["workers"].values() if w.user_account_id == user.id), None)
        if not worker_profile:
            return []
        records = [r for r in records if r.worker_id == worker_profile.id]
    elif worker_id:
        records = [r for r in records if r.worker_id == worker_id]
        
    return records
