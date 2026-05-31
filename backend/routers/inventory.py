from fastapi import APIRouter, Depends, HTTPException
from models.user import UserInDB, Role
from models.inventory import (
    MaterialCreate, MaterialInDB,
    WarehouseCreate, WarehouseInDB,
    EquipmentCreate, EquipmentInDB, EquipmentStatus
)
from routers.auth import require_role
import uuid
from database import local_db
from typing import List

router = APIRouter(prefix="/inventory", tags=["inventory"])

# Initialize storage for MVP
if "materials" not in local_db: local_db["materials"] = {}
if "warehouses" not in local_db: local_db["warehouses"] = {}
if "equipment" not in local_db: local_db["equipment"] = {}

# --- Materials Catalog ---
@router.post("/materials", response_model=MaterialInDB)
async def create_material(material: MaterialCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    material_id = str(uuid.uuid4())
    db_material = MaterialInDB(**material.model_dump(), id=material_id)
    local_db["materials"][material_id] = db_material
    return db_material

@router.get("/materials", response_model=List[MaterialInDB])
async def get_materials(user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER, Role.ACCOUNTANT]))):
    return list(local_db["materials"].values())

# --- Warehouses ---
@router.post("/warehouses", response_model=WarehouseInDB)
async def create_warehouse(warehouse: WarehouseCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    warehouse_id = str(uuid.uuid4())
    db_warehouse = WarehouseInDB(**warehouse.model_dump(), id=warehouse_id)
    local_db["warehouses"][warehouse_id] = db_warehouse
    return db_warehouse

@router.get("/warehouses", response_model=List[WarehouseInDB])
async def get_warehouses(user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER]))):
    return list(local_db["warehouses"].values())

# --- Equipment ---
@router.post("/equipment", response_model=EquipmentInDB)
async def create_equipment(equipment: EquipmentCreate, user: UserInDB = Depends(require_role([Role.ADMIN]))):
    equipment_id = str(uuid.uuid4())
    db_equipment = EquipmentInDB(**equipment.model_dump(), id=equipment_id)
    local_db["equipment"][equipment_id] = db_equipment
    return db_equipment

@router.get("/equipment", response_model=List[EquipmentInDB])
async def get_equipment(user: UserInDB = Depends(require_role([Role.ADMIN, Role.SITE_MANAGER]))):
    return list(local_db["equipment"].values())
