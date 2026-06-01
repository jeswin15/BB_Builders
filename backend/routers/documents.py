from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from database import get_db, get_gridfs
import time
from bson import ObjectId

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

@router.get("", response_model=List[DocumentModel])
async def get_documents(db=Depends(get_db)):
    cursor = db["documents"].find()
    docs = await cursor.to_list(length=1000)
    for d in docs:
        d.pop('_id', None)
    return docs

@router.post("", response_model=DocumentModel)
async def create_document(
    title: str = Form(...),
    type: str = Form(...),
    project: Optional[str] = Form(""),
    uploadedBy: str = Form(...),
    file: UploadFile = File(...),
    db=Depends(get_db),
    gridfs=Depends(get_gridfs)
):
    # Upload the file stream directly into MongoDB GridFS
    grid_in = gridfs.open_upload_stream(file.filename, metadata={"contentType": file.content_type})
    
    # Read and write chunks
    while True:
        chunk = await file.read(1024 * 1024) # 1MB chunks
        if not chunk:
            break
        await grid_in.write(chunk)
    
    await grid_in.close()
    
    gridfs_id = str(grid_in._id)
    file_size_mb = f"{(grid_in.length / (1024 * 1024)):.2f} MB"
    
    doc_id = f"DOC-{int(time.time())}"
    date_str = time.strftime("%Y-%m-%d")
    file_url = f"/api/documents/file/{gridfs_id}"
    
    doc = {
        "id": doc_id,
        "title": title,
        "type": type,
        "project": project,
        "uploadedBy": uploadedBy,
        "date": date_str,
        "size": file_size_mb,
        "fileUrl": file_url,
        "gridFsId": gridfs_id
    }
    
    await db["documents"].insert_one(doc)
    return doc

@router.get("/file/{gridfs_id}")
async def get_document_file(gridfs_id: str, gridfs=Depends(get_gridfs)):
    try:
        grid_out = await gridfs.open_download_stream(ObjectId(gridfs_id))
    except Exception:
        raise HTTPException(status_code=404, detail="File not found in GridFS")

    async def file_streamer():
        while True:
            chunk = await grid_out.read(1024 * 1024)
            if not chunk:
                break
            yield chunk

    # Get content type if stored, otherwise default to octet-stream
    content_type = grid_out.metadata.get("contentType", "application/octet-stream") if grid_out.metadata else "application/octet-stream"
    
    return StreamingResponse(
        file_streamer(), 
        media_type=content_type,
        headers={"Content-Disposition": f"inline; filename={grid_out.filename}"}
    )

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db=Depends(get_db), gridfs=Depends(get_gridfs)):
    doc = await db["documents"].find_one({"id": doc_id})
    if doc and doc.get("gridFsId"):
        try:
            await gridfs.delete(ObjectId(doc["gridFsId"]))
        except Exception as e:
            print(f"Error deleting file from GridFS: {e}")
                
    await db["documents"].delete_one({"id": doc_id})
    return {"status": "deleted"}
