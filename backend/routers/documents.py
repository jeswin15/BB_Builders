from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/api/documents", tags=["documents"])

class DocumentModel(BaseModel):
    id: str
    title: str
    type: str
    project: str
    uploadedBy: str
    date: str
    size: str

@router.get("", response_model=List[DocumentModel])
async def get_documents(db=Depends(get_db)):
    cursor = db["documents"].find()
    docs = await cursor.to_list(length=1000)
    for d in docs:
        d.pop('_id', None)
    return docs

@router.post("", response_model=DocumentModel)
async def create_document(document: DocumentModel, db=Depends(get_db)):
    await db["documents"].insert_one(document.model_dump())
    return document

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db=Depends(get_db)):
    await db["documents"].delete_one({"id": doc_id})
    return {"status": "deleted"}
