import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # MongoDB Config
    DATABASE_URL: str = "mysql+pymysql://3e3vM2fEpj5GyGA.root:aUtMqMdJKA2tKIpU@gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com:4000/bb_builders"
    DATABASE_NAME: str = "bb_builders_erp"
    
    # Auth Config
    SECRET_KEY: str = "generate_a_random_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Server Config
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
