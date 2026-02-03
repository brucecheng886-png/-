"""
應用配置管理
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """應用設置"""
    
    # 應用配置
    APP_NAME: str = "BruV_Project"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # API 配置
    DIFY_API_URL: str = os.getenv("DIFY_API_URL", "http://localhost:80/v1")
    DIFY_API_KEY: str = os.getenv("DIFY_API_KEY", "")
    DIFY_SECRET_KEY: str = os.getenv("DIFY_SECRET_KEY", "")
    
    RAGFLOW_API_URL: str = os.getenv("RAGFLOW_API_URL", "http://localhost:81/api/v1")
    RAGFLOW_API_KEY: str = os.getenv("RAGFLOW_API_KEY", "")
    
    # 資料庫配置 - 使用 C:\BruV_Data 避免中文路徑問題
    KUZU_DB_PATH: str = os.getenv("KUZU_DB_PATH", "C:/BruV_Data/kuzu_db")
    
    # 超時設置
    REQUEST_TIMEOUT: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # 允許額外的環境變數


settings = Settings()
