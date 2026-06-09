from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager
from database import get_db, init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="BB Builders ERP API",
    description="Enterprise-grade cloud-based Construction ERP (TiDB)",
    version="1.0.0",
    lifespan=lifespan
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

from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

frontend_dist = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.exception_handler(404)
    async def custom_404_handler(request: Request, exc: StarletteHTTPException):
        if request.url.path.startswith("/api/"):
            return JSONResponse({"detail": exc.detail}, status_code=404)
        
        # Check if the file actually exists (for non-asset static files like favicon)
        file_path = os.path.join(frontend_dist, request.url.path.lstrip("/"))
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to BB Builders ERP API (MongoDB Atlas Connected)"}
