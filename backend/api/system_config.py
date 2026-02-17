"""
系統配置管理 — 輔助函式 & Pydantic 模型

從 system.py 拆分，包含：
- ConfigUpdateRequest / ConfigResponse 模型
- .env 讀寫工具
- API Key 遮罩 / 偵測
"""
from pydantic import BaseModel
from typing import Optional
import os
import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------ #
#  Pydantic Models
# ------------------------------------------------------------------ #

class ConfigUpdateRequest(BaseModel):
    """配置更新請求模型"""
    dify_key: Optional[str] = None
    ragflow_key: Optional[str] = None
    dify_api_url: Optional[str] = None
    ragflow_api_url: Optional[str] = None


class ConfigResponse(BaseModel):
    """配置響應模型"""
    success: bool
    message: str
    config: Optional[dict] = None


# ------------------------------------------------------------------ #
#  .env 相關工具
# ------------------------------------------------------------------ #

def get_env_file_path() -> Path:
    """獲取 .env 檔案路徑"""
    current_dir = Path.cwd()
    env_path = current_dir / ".env"
    if not env_path.exists():
        env_path = current_dir.parent / ".env"
    return env_path


def mask_api_key(key: Optional[str]) -> str:
    """遮蔽 API Key，只顯示前 5 碼"""
    if not key or len(key) <= 5:
        return "******"
    return f"{key[:5]}{'*' * (len(key) - 5)}"


def is_masked_key(key: Optional[str]) -> bool:
    """檢測是否為遮罩後的 API Key"""
    if not key:
        return False
    return '***' in key


def read_env_file() -> dict:
    """讀取 .env 檔案內容"""
    env_path = get_env_file_path()
    if not env_path.exists():
        logger.warning(f".env 檔案不存在: {env_path}")
        return {}

    env_vars = {}
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    except Exception as e:
        logger.error(f"讀取 .env 檔案失敗: {e}")
    return env_vars


def update_env_file(updates: dict) -> bool:
    """更新 .env 檔案中的變數"""
    env_path = get_env_file_path()
    try:
        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        else:
            logger.info(f"創建新的 .env 檔案: {env_path}")
            lines = []

        updated_vars = set()
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if not line_stripped or line_stripped.startswith('#'):
                continue
            for key, value in updates.items():
                pattern = rf'^{re.escape(key)}\s*=\s*.*$'
                if re.match(pattern, line_stripped):
                    lines[i] = f"{key}={value}\n"
                    updated_vars.add(key)
                    logger.info(f"更新變數: {key}")
                    break

        for key, value in updates.items():
            if key not in updated_vars:
                lines.append(f"{key}={value}\n")
                logger.info(f"新增變數: {key}")

        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        logger.info(f"成功更新 .env 檔案: {env_path}")
        return True
    except Exception as e:
        logger.error(f"更新 .env 檔案失敗: {e}")
        return False


def reload_env_to_os() -> None:
    """重新載入 .env 到 os.environ"""
    env_vars = read_env_file()
    for key, value in env_vars.items():
        os.environ[key] = value
        logger.debug(f"載入環境變數: {key}")
