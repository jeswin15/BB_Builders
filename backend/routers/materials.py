from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/api/materials", tags=["materials"])

class MaterialModel(BaseModel):
    id: str
    code: str
    name: str
    category: str
    stock: int
    unit: str
    minStock: int
    location: str
    supplier: str = ""
    price: float = 0.0
    lastRestocked: str = ""
    history: list = []

@router.get("", response_model=List[MaterialModel])
async def get_materials(db=Depends(get_db)):
    cursor = db["materials"].find()
    materials = await cursor.to_list(length=1000)
    for m in materials:
        m.pop('_id', None)
    return materials

@router.post("", response_model=MaterialModel)
async def create_material(material: MaterialModel, db=Depends(get_db)):
    await db["materials"].insert_one(material.model_dump())
    return material

@router.put("/{material_id}", response_model=MaterialModel)
async def update_material(material_id: str, material: MaterialModel, db=Depends(get_db)):
    await db["materials"].update_one({"id": material_id}, {"$set": material.model_dump()})
    return material
