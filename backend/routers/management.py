from database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserInDB, Role
from models.management import (
    ClientCreate, ClientInDB, 
    ProjectCreate, ProjectInDB,
    SiteCreate, SiteInDB
)
from routers.auth import require_role
import uuid
from database import local_db
from typing import List

router = APIRouter(prefix="/management", tags=["management"])

# Initialize storage for MVP
if "clients" not in local_db: local_db["clients"] = {}
if "projects" not in local_db: local_db["projects"] = {}
if "sites" not in local_db: local_db["sites"] = {}

# --- Clients ---
@router.post("/clients", response_model=ClientInDB)
async def create_client(client: ClientCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    client_id = str(uuid.uuid4())
    db_client = ClientInDB(**client.model_dump(), id=client_id)
    local_db["clients"][client_id] = db_client
    return db_client

@router.get("", response_model=List[ManagementNoteModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(ManagementNote))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=ManagementNoteModel)
def create_item(item: ManagementNoteModel, db: Session = Depends(get_db)):
    db.add(ManagementNote(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=ManagementNoteModel)
def update_item(id: str, item: ManagementNoteModel, db: Session = Depends(get_db)):
    db.execute(update(ManagementNote).where(ManagementNote.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(ManagementNote).where(ManagementNote.id == id))
    db.commit()
    return {"status": "deleted"}
