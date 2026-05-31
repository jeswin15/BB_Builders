from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from database import get_db

app = FastAPI(
    title="BB Builders ERP API",
    description="Enterprise-grade cloud-based Construction ERP (MongoDB)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import projects, workers, invoices, finance, clients, auth, sites, materials, equipment, documents
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(workers.router)
app.include_router(invoices.router)
app.include_router(finance.router)
app.include_router(clients.router)
app.include_router(sites.router)
app.include_router(materials.router)
app.include_router(equipment.router)
app.include_router(documents.router)

frontend_dist = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to BB Builders ERP API (MongoDB Atlas Connected)"}
