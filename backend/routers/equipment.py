from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/api/equipment", tags=["equipment"])

class EquipmentModel(BaseModel):
    id: str
    code: str
    name: str
    type: str
    owned: bool
    status: str
    site: str

@router.get("/", response_model=List[EquipmentModel])
async def get_equipment(db=Depends(get_db)):
    cursor = db["equipment"].find()
    equipment = await cursor.to_list(length=1000)
    for e in equipment:
        e.pop('_id', None)
    return equipment

@router.post("/", response_model=EquipmentModel)
async def create_equipment(item: EquipmentModel, db=Depends(get_db)):
    await db["equipment"].insert_one(item.model_dump())
    return item

@router.put("/{item_id}", response_model=EquipmentModel)
async def update_equipment(item_id: str, item: EquipmentModel, db=Depends(get_db)):
    await db["equipment"].update_one({"id": item_id}, {"$set": item.model_dump()})
    return item
