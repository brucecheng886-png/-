"""
應用配置管理 — 統一配置來源
優先級: config.json > 環境變數 (.env) > 程式碼預設值
"""
import json
import threading
import logging
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# 跨平台資料目錄：優先使用環境變數，否則使用使用者目錄下的 BruV_Data
_DATA_DIR = Path(__import__('os').environ.get(
    "BRUV_DATA_DIR",
    str(Path.home() / "BruV_Data")
))

# 配置文件路徑
CONFIG_FILE_PATH = _DATA_DIR / "config.json"

# 讀寫鎖，防止 read-modify-write 競態
_config_lock = threading.Lock()


def load_config_from_file() -> Dict[str, Any]:
    """從 config.json 讀取配置（線程安全）"""
    with _config_lock:
        if CONFIG_FILE_PATH.exists():
            try:
                with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    logger.debug(f"從 {CONFIG_FILE_PATH} 載入配置")
                    return config
            except Exception as e:
                logger.warning(f"讀取配置文件失敗: {e}，使用默認配置")
    return {}


def save_config_to_file(config: Dict[str, Any]) -> bool:
    """保存配置到 config.json（線程安全、原子性寫入）"""
    with _config_lock:
        try:
            CONFIG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)

            # 讀取現有配置
            existing = {}
            if CONFIG_FILE_PATH.exists():
                try:
                    with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
                        existing = json.load(f)
                except Exception:
                    pass

            existing.update(config)

            # 先寫入臨時檔再重命名（原子性）
            tmp_path = CONFIG_FILE_PATH.with_suffix('.json.tmp')
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump(existing, f, indent=2, ensure_ascii=False)
            tmp_path.replace(CONFIG_FILE_PATH)

            logger.info(f"配置已保存到 {CONFIG_FILE_PATH}")

            # 清除快取，讓下次 get_current_api_keys() 讀到新值
            get_current_api_keys.cache_clear()
            return True
        except Exception as e:
            logger.error(f"保存配置文件失敗: {e}")
            return False


class Settings(BaseSettings):
    """
    統一應用設置
    所有模組都應透過此類取得配置，禁止自行 os.getenv()。
    """

    # 應用配置
    APP_NAME: str = "BruV_Project"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "production"

    # 伺服器
    HOST: str = "127.0.0.1"
    PORT: int = 8765

    # API 配置
    DIFY_API_URL: str = "http://localhost:5001/v1"
    DIFY_API_KEY: str = ""

    RAGFLOW_API_URL: str = "http://localhost:9380/api/v1"
    RAGFLOW_API_KEY: str = ""

    # 資料目錄
    BRUV_DATA_DIR: str = Field(default_factory=lambda: str(_DATA_DIR))

    # 資料庫配置
    KUZU_DB_PATH: str = Field(default_factory=lambda: str(_DATA_DIR / "kuzu_db"))

    # 監控目錄
    AUTO_IMPORT_DIR: str = Field(default_factory=lambda: str(_DATA_DIR / "Auto_Import"))

    # 媒體庫
    MEDIA_LIBRARY_PATH: str = Field(default_factory=lambda: str(_DATA_DIR / "media_library"))

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = ""

    # 超時設置（秒）
    REQUEST_TIMEOUT: int = 30

    # 認證
    BRUV_AUTH_ENABLED: bool = True
    BRUV_API_TOKEN: str = ""

    # 上傳限制 (bytes) — 預設 100 MB
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "allow",
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # 載入 config.json 配置（優先級最高，覆蓋環境變數）
        file_config = load_config_from_file()
        if file_config:
            for json_key, attr_name in [
                ('dify_api_url', 'DIFY_API_URL'),
                ('dify_api_key', 'DIFY_API_KEY'),
                ('ragflow_api_url', 'RAGFLOW_API_URL'),
                ('ragflow_api_key', 'RAGFLOW_API_KEY'),
            ]:
                val = file_config.get(json_key)
                if val:
                    setattr(self, attr_name, val)


# 全域 Settings 單例
settings = Settings()


@lru_cache(maxsize=1)
def get_current_api_keys() -> Dict[str, str]:
    """
    動態獲取當前的 API Keys
    優先級: config.json > 環境變數 > settings 預設值
    結果被快取，save_config_to_file() 時自動清除快取。
    """
    file_config = load_config_from_file()

    return {
        'DIFY_API_KEY': file_config.get('dify_api_key') or settings.DIFY_API_KEY,
        'RAGFLOW_API_KEY': file_config.get('ragflow_api_key') or settings.RAGFLOW_API_KEY,
        'DIFY_API_URL': file_config.get('dify_api_url') or settings.DIFY_API_URL,
        'RAGFLOW_API_URL': file_config.get('ragflow_api_url') or settings.RAGFLOW_API_URL,
    }

