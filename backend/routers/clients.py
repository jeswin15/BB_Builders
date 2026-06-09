from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from models.schema import Client
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/clients", tags=["clients"])

class ClientModel(BaseModel):
    id: str
    company: str
    contact: str
    phone: str
    email: str
    value: str

@router.get("", response_model=List[ClientModel])
def get_all(db: Session = Depends(get_db)):
    result = db.execute(select(Client))
    return [r.data for r in result.scalars().all()]

@router.post("", response_model=ClientModel)
def create_item(item: ClientModel, db: Session = Depends(get_db)):
    db.add(Client(id=item.id, data=item.model_dump()))
    db.commit()
    return item

@router.put("/{id}", response_model=ClientModel)
def update_item(id: str, item: ClientModel, db: Session = Depends(get_db)):
    db.execute(update(Client).where(Client.id == id).values(data=item.model_dump()))
    db.commit()
    return item

@router.delete("/{id}")
def delete_item(id: str, db: Session = Depends(get_db)):
    db.execute(delete(Client).where(Client.id == id))
    db.commit()
    return {"status": "deleted"}
