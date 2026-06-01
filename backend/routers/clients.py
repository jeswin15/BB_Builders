from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/api/clients", tags=["clients"])

class ClientModel(BaseModel):
    id: str
    company: str
    contact: str
    phone: str
    email: str
    value: str

@router.get("", response_model=List[ClientModel])
async def get_clients(db=Depends(get_db)):
    cursor = db["clients"].find()
    clients = await cursor.to_list(length=1000)
    for c in clients:
        c.pop('_id', None)
    return clients

@router.post("", response_model=ClientModel)
async def create_client(client: ClientModel, db=Depends(get_db)):
    await db["clients"].insert_one(client.model_dump())
    return client

@router.put("/{client_id}", response_model=ClientModel)
async def update_client(client_id: str, client: ClientModel, db=Depends(get_db)):
    await db["clients"].update_one({"id": client_id}, {"$set": client.model_dump()})
    return client
