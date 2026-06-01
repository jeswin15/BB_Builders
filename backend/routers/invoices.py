from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Any
from database import get_db

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

class InvoiceModel(BaseModel):
    id: str
    invoiceType: str
    date: str
    targetId: str
    targetName: str
    targetRoleOrProject: str
    targetLocationOrSite: str
    items: List[Any]
    subtotal: float
    totalGst: float
    total: float

@router.get("", response_model=List[InvoiceModel])
async def get_invoices(db=Depends(get_db)):
    cursor = db["invoices"].find()
    invoices = await cursor.to_list(length=1000)
    for i in invoices:
        i.pop('_id', None)
    return invoices

@router.post("", response_model=InvoiceModel)
async def create_invoice(invoice: InvoiceModel, db=Depends(get_db)):
    await db["invoices"].insert_one(invoice.model_dump())
    return invoice

@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str, db=Depends(get_db)):
    await db["invoices"].delete_one({"id": invoice_id})
    return {"status": "deleted"}
