from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from models.schema import Document
import time
import os
import uuid

router = APIRouter(prefix="/api/documents", tags=["documents"])

class DocumentModel(BaseModel):
    id: str
    title: str
    type: str
    project: str
    uploadedBy: str
    date: str
    size: str
    fileUrl: Optional[str] = None
    gridFsId: Optional[str] = None

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[DocumentModel])
def get_documents(db: Session = Depends(get_db)):
    result = db.execute(select(Document))
    return [d.data for d in result.scalars().all()]

@router.post("", response_model=DocumentModel)
async def create_document(
    title: str = Form(...),
    type: str = Form(...),
    project: Optional[str] = Form(""),
    uploadedBy: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file locally (can stay async since it uses await file.read())
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            buffer.write(chunk)
            
    file_size_mb = f"{(os.path.getsize(file_path) / (1024 * 1024)):.2f} MB"
    
    doc_id = f"DOC-{int(time.time())}"
    date_str = time.strftime("%Y-%m-%d")
    file_url = f"/api/documents/file/{unique_filename}"
    
    doc = {
        "id": doc_id,
        "title": title,
        "type": type,
        "project": project,
        "uploadedBy": uploadedBy,
        "date": date_str,
        "size": file_size_mb,
        "fileUrl": file_url,
        "gridFsId": unique_filename # Reuse this field for the local filename
    }
    
    db.add(Document(id=doc_id, data=doc))
    db.commit()
    return doc

@router.get("/file/{filename}")
def get_document_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path, headers={"Content-Disposition": f"inline; filename={filename}"})

@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    result = db.execute(select(Document).where(Document.id == doc_id))
    doc_record = result.scalars().first()
    
    if doc_record:
        doc_data = doc_record.data
        filename = doc_data.get("gridFsId")
        if filename:
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                
        db.execute(delete(Document).where(Document.id == doc_id))
        db.commit()
        
    return {"status": "deleted"}
