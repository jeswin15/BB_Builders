from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# --- Document Management Models ---
class DocumentType(str, Enum):
    BLUEPRINT = "Blueprint"
    SITE_PLAN = "Site Plan"
    CONTRACT = "Contract"
    INVOICE = "Invoice"
    PERMIT = "Permit"
    REPORT = "Report"
    OTHER = "Other"

class DocumentBase(BaseModel):
    title: str
    type: DocumentType
    project_id: Optional[str] = None
    site_id: Optional[str] = None
    uploaded_by: str
    file_url: str # Represents the Oracle Object Storage URL
    size_mb: float

class DocumentCreate(DocumentBase):
    pass

class DocumentInDB(DocumentBase):
    id: str
    uploaded_at: datetime = datetime.now()

# --- Analytics Models ---
class AnalyticsInsight(BaseModel):
    title: str
    description: str
    impact: str # Positive, Negative, Neutral
    data_points: Dict[str, Any]
    generated_at: datetime = datetime.now()
