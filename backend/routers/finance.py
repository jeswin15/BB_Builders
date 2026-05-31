from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/api/finance", tags=["finance"])

class TransactionModel(BaseModel):
    id: str
    date: str
    type: str
    category: str
    description: str
    amount: float

@router.get("/transactions", response_model=List[TransactionModel])
async def get_transactions(db=Depends(get_db)):
    cursor = db["transactions"].find()
    transactions = await cursor.to_list(length=1000)
    for t in transactions:
        t.pop('_id', None)
    return transactions

@router.post("/transactions", response_model=TransactionModel)
async def create_transaction(transaction: TransactionModel, db=Depends(get_db)):
    await db["transactions"].insert_one(transaction.model_dump())
    return transaction
