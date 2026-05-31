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

@router.get("/clients", response_model=List[ClientInDB])
async def get_clients(user: UserInDB = Depends(require_role([Role.ADMIN]))):
    return list(local_db["clients"].values())

# --- Projects ---
@router.post("/projects", response_model=ProjectInDB)
async def create_project(project: ProjectCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    # Verify client exists
    if project.client_id not in local_db["clients"]:
        raise HTTPException(status_code=404, detail="Client not found")
        
    project_id = str(uuid.uuid4())
    db_project = ProjectInDB(**project.model_dump(), id=project_id)
    local_db["projects"][project_id] = db_project
    return db_project

@router.get("/projects", response_model=List[ProjectInDB])
async def get_projects(user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER]))):
    return list(local_db["projects"].values())

# --- Sites ---
@router.post("/sites", response_model=SiteInDB)
async def create_site(site: SiteCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    # Verify project exists
    if site.project_id not in local_db["projects"]:
        raise HTTPException(status_code=404, detail="Project not found")
        
    site_id = str(uuid.uuid4())
    db_site = SiteInDB(**site.model_dump(), id=site_id)
    local_db["sites"][site_id] = db_site
    return db_site

@router.get("/sites", response_model=List[SiteInDB])
async def get_sites(user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER]))):
    # Site managers might only see their own sites in a real scenario
    if user.role == Role.SITE_MANAGER:
        return [s for s in local_db["sites"].values() if s.site_engineer_id == user.id]
    return list(local_db["sites"].values())
