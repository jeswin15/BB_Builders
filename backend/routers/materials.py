from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

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
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Material))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=MaterialModel)
def create_item(item: MaterialModel, db: Session = Depends(get_db)):
    db.add(Material(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=MaterialModel)
def update_item(id: str, item: MaterialModel, db: Session = Depends(get_db)):
    db.execute(update(Material).where(Material.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Material).where(Material.id == id))
    db.commit()
    return {"status": "deleted"}
