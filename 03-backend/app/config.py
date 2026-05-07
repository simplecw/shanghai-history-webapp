# Configuration
import os


class Config:
    DB_HOST: str = os.getenv("DB_HOST", "192.168.1.108")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "chenwei")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "761211")
    DB_NAME: str = os.getenv("DB_NAME", "SHANGHAI_HISTORY")
    
    DATABASE_URL: str = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?charset=utf8mb4&use_unicode=True&binary_prefix=True"
    )
    
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = ["*"]


config = Config()
