from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum

# --- Worker Models ---
class SkillCategory(str, Enum):
    MASON = "Mason"
    HELPER = "Helper"
    ELECTRICIAN = "Electrician"
    PLUMBER = "Plumber"
    CARPENTER = "Carpenter"
    PAINTER = "Painter"
    SUPERVISOR = "Supervisor"

class WorkerStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    ON_LEAVE = "On Leave"

class WorkerBase(BaseModel):
    user_account_id: Optional[str] = None # Link to auth user if they have portal access
    full_name: str
    aadhaar_number: str
    phone_number: str
    emergency_contact: str
    joining_date: date
    skill_category: SkillCategory
    assigned_site_id: str
    daily_wage: float = Field(..., gt=0)
    overtime_rate: float = Field(..., ge=0)
    status: WorkerStatus = WorkerStatus.ACTIVE

class WorkerCreate(WorkerBase):
    pass

class WorkerInDB(WorkerBase):
    id: str
    created_at: datetime = datetime.now()

# --- Attendance Models ---
class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"
    HALF_DAY = "Half-Day"
    LEAVE = "Leave"
    HOLIDAY = "Holiday"

class AttendanceBase(BaseModel):
    worker_id: str
    site_id: str
    date: date
    status: AttendanceStatus
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    hours_worked: float = 0.0
    overtime_hours: float = 0.0
    # The wage calculated for this specific day based on status and overtime
    calculated_daily_wage: float = 0.0 

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceInDB(AttendanceBase):
    id: str
    created_at: datetime = datetime.now()
