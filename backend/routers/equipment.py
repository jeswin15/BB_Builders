from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/equipment", tags=["equipment"])

class EquipmentModel(BaseModel):
    id: str
    code: str
    name: str
    type: str
    owned: bool
    status: str
    site: str
    maintenanceSchedule: str = ""
    fuelCost: float = 0.0
    operator: str = ""

@router.get("", response_model=List[EquipmentModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Equipment))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=EquipmentModel)
def create_item(item: EquipmentModel, db: Session = Depends(get_db)):
    db.add(Equipment(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=EquipmentModel)
def update_item(id: str, item: EquipmentModel, db: Session = Depends(get_db)):
    db.execute(update(Equipment).where(Equipment.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Equipment).where(Equipment.id == id))
    db.commit()
    return {"status": "deleted"}
