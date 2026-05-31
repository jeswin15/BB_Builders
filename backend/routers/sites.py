from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from database import get_db

router = APIRouter(prefix="/api/sites", tags=["sites"])

class SiteModel(BaseModel):
    id: str
    name: str
    project: str
    location: str
    engineers: int
    workers: int
    status: str

@router.get("/", response_model=List[SiteModel])
async def get_sites(db=Depends(get_db)):
    cursor = db["sites"].find()
    sites = await cursor.to_list(length=1000)
    for s in sites:
        s.pop('_id', None)
    return sites

@router.post("/", response_model=SiteModel)
async def create_site(site: SiteModel, db=Depends(get_db)):
    await db["sites"].insert_one(site.model_dump())
    return site

@router.put("/{site_id}", response_model=SiteModel)
async def update_site(site_id: str, site: SiteModel, db=Depends(get_db)):
    await db["sites"].update_one({"id": site_id}, {"$set": site.model_dump()})
    return site
