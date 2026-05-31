from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime

class Role(str, Enum):
    SUPER_ADMIN = "Super Admin"
    ADMIN = "Admin"
    SITE_MANAGER = "Site Manager"
    ACCOUNTANT = "Accountant"
    CLIENT = "Client"
    WORKER = "Worker"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Role

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = datetime.now()

class UserOut(UserBase):
    id: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None
