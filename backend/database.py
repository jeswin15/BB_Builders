from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import settings
from models.schema import Base

# Create Sync Engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_recycle=3600,
    pool_pre_ping=True,
    connect_args={"ssl": {"ssl": True}}
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_gridfs():
    raise NotImplementedError("GridFS is no longer supported in TiDB migration.")
