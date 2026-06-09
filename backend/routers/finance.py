from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from models.schema import FinanceTransaction

router = APIRouter(prefix="/api/finance", tags=["finance"])

class TransactionModel(BaseModel):
    id: str
    date: str
    type: str
    category: str
    description: str
    amount: float
    site: Optional[str] = None

@router.get("", response_model=List[TransactionModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(FinanceTransaction))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=TransactionModel)
def create_item(item: TransactionModel, db: Session = Depends(get_db)):
    db.add(FinanceTransaction(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=TransactionModel)
def update_item(id: str, item: TransactionModel, db: Session = Depends(get_db)):
    db.execute(update(FinanceTransaction).where(FinanceTransaction.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(FinanceTransaction).where(FinanceTransaction.id == id))
    db.commit()
    return {"status": "deleted"}
