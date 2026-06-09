from database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Any

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

class InvoiceModel(BaseModel):
    id: str
    invoiceType: str
    date: str
    targetId: str
    targetName: str
    targetRoleOrProject: str
    targetLocationOrSite: str
    fromName: str = "BB Builders"
    fromAddress: str = "123 Construction Avenue\nTech Park, Bangalore 560001"
    fromGSTIN: str = "29ABCDE1234F1Z5"
    items: List[Any]
    subtotal: float
    totalGst: float
    total: float

@router.get("", response_model=List[InvoiceModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Invoice))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=InvoiceModel)
def create_item(item: InvoiceModel, db: Session = Depends(get_db)):
    db.add(Invoice(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=InvoiceModel)
def update_item(id: str, item: InvoiceModel, db: Session = Depends(get_db)):
    db.execute(update(Invoice).where(Invoice.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Invoice).where(Invoice.id == id))
    db.commit()
    return {"status": "deleted"}
