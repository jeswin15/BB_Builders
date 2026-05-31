from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# --- Client Models ---
class ClientBase(BaseModel):
    company_name: str
    contact_person: str
    mobile_number: str
    email_address: EmailStr
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    billing_address: str
    contract_value: float = 0.0
    payment_terms: str

class ClientCreate(ClientBase):
    pass

class ClientInDB(ClientBase):
    id: str
    created_at: datetime = datetime.now()

# --- Project Models ---
class ProjectStatus(str, Enum):
    INITIATED = "Initiated"
    IN_PROGRESS = "In Progress"
    ON_HOLD = "On Hold"
    COMPLETED = "Completed"

class ProjectBase(BaseModel):
    name: str
    client_id: str
    budget: float
    status: ProjectStatus = ProjectStatus.INITIATED
    expected_completion_date: datetime
    actual_completion_date: Optional[datetime] = None
    project_manager_id: str

class ProjectCreate(ProjectBase):
    pass

class ProjectInDB(ProjectBase):
    id: str
    created_at: datetime = datetime.now()

# --- Site Models ---
class SiteStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    COMPLETED = "Completed"

class SiteBase(BaseModel):
    project_id: str
    name: str
    location: str
    site_engineer_id: str
    status: SiteStatus = SiteStatus.ACTIVE
    progress_percentage: float = 0.0
    budget_allocated: float = 0.0

class SiteCreate(SiteBase):
    pass

class SiteInDB(SiteBase):
    id: str
    created_at: datetime = datetime.now()
