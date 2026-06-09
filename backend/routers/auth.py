from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.user import UserCreate, UserOut, Token, UserInDB, Role
from models.schema import User
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid
from database import get_db
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/seed")
def seed_admin(db: Session = Depends(get_db)):
    result = db.execute(select(User).where(User.email == "bharathiadmin@bbbuilders.com"))
    existing_admin = result.scalars().first()
    if not existing_admin:
        admin_id = str(uuid.uuid4())
        new_admin = User(
            id=admin_id,
            email="bharathiadmin@bbbuilders.com",
            full_name="Bharathi Admin",
            role=Role.SUPER_ADMIN,
            hashed_password=get_password_hash("BBbuilders123"),
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        return {"msg": "Admin seeded"}
    return {"msg": "Admin already exists"}

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    result = db.execute(select(User).where(User.email == user.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    
    return UserOut(
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=True
    )

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    refresh_token = create_access_token(
        data={"sub": user.email, "role": user.role, "type": "refresh"}, 
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
    )

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = db.execute(select(User).where(User.email == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
        
    return UserInDB(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=user.hashed_password,
        is_active=user.is_active
    )

def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(allowed_roles: list[Role]):
    def role_dependency(current_user: UserInDB = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles and current_user.role != Role.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_dependency
