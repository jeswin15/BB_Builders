from database import get_db
from sqlalchemy.orm import Session
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

@router.get("", response_model=List[InventoryModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(InventoryItem))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=InventoryModel)
def create_item(item: InventoryModel, db: Session = Depends(get_db)):
    db.add(InventoryItem(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=InventoryModel)
def update_item(id: str, item: InventoryModel, db: Session = Depends(get_db)):
    db.execute(update(InventoryItem).where(InventoryItem.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(InventoryItem).where(InventoryItem.id == id))
    db.commit()
    return {"status": "deleted"}
