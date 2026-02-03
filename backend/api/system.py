"""
系統配置管理 API
用於動態更新 .env 檔案中的 API Keys
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter()


class ConfigUpdateRequest(BaseModel):
    """配置更新請求模型"""
    dify_key: Optional[str] = None
    ragflow_key: Optional[str] = None


class ConfigResponse(BaseModel):
    """配置響應模型"""
    success: bool
    message: str
    config: Optional[dict] = None


def get_env_file_path() -> Path:
    """獲取 .env 檔案路徑"""
    # 從當前工作目錄開始尋找 .env
    current_dir = Path.cwd()
    env_path = current_dir / ".env"
    
    # 如果當前目錄沒有，嘗試父目錄（適應不同啟動位置）
    if not env_path.exists():
        env_path = current_dir.parent / ".env"
    
    return env_path


def mask_api_key(key: Optional[str]) -> str:
    """遮蔽 API Key，只顯示前 5 碼"""
    if not key or len(key) <= 5:
        return "******"
    return f"{key[:5]}{'*' * (len(key) - 5)}"


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
                # 跳過註釋和空行
                if not line or line.startswith('#'):
                    continue
                # 解析 KEY=VALUE
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
        # 讀取現有內容
        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        else:
            logger.info(f"創建新的 .env 檔案: {env_path}")
            lines = []
        
        # 追蹤哪些變數已經更新
        updated_vars = set()
        
        # 處理現有行
        for i, line in enumerate(lines):
            original_line = line
            line_stripped = line.strip()
            
            # 跳過註釋和空行
            if not line_stripped or line_stripped.startswith('#'):
                continue
            
            # 檢查是否需要更新此行
            for key, value in updates.items():
                # 使用正則表達式匹配 KEY=...
                pattern = rf'^{re.escape(key)}\s*=\s*.*$'
                if re.match(pattern, line_stripped):
                    lines[i] = f"{key}={value}\n"
                    updated_vars.add(key)
                    logger.info(f"更新變數: {key}")
                    break
        
        # 添加未找到的新變數
        for key, value in updates.items():
            if key not in updated_vars:
                lines.append(f"{key}={value}\n")
                logger.info(f"新增變數: {key}")
        
        # 寫回檔案
        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        logger.info(f"成功更新 .env 檔案: {env_path}")
        return True
        
    except Exception as e:
        logger.error(f"更新 .env 檔案失敗: {e}")
        return False


def reload_env_to_os() -> None:
    """重新載入 .env 到 os.environ（嘗試即時生效）"""
    env_vars = read_env_file()
    for key, value in env_vars.items():
        os.environ[key] = value
        logger.debug(f"載入環境變數: {key}")


@router.get("/config")
async def get_config():
    """
    獲取當前系統配置（API Keys 已遮蔽）
    
    返回格式:
    {
        "success": true,
        "config": {
            "dify_key": "app-x*****",
            "ragflow_key": "ragfl*****",
            "dify_api_url": "http://localhost:80/v1",
            "ragflow_api_url": "http://localhost:81/api/v1"
        }
    }
    """
    try:
        # 讀取環境變數
        dify_key = os.getenv('DIFY_API_KEY', '')
        ragflow_key = os.getenv('RAGFLOW_API_KEY', '')
        dify_url = os.getenv('DIFY_API_URL', 'http://localhost:80/v1')
        ragflow_url = os.getenv('RAGFLOW_API_URL', 'http://localhost:81/api/v1')
        
        return ConfigResponse(
            success=True,
            message="配置獲取成功",
            config={
                "dify_key": mask_api_key(dify_key),
                "ragflow_key": mask_api_key(ragflow_key),
                "dify_api_url": dify_url,
                "ragflow_api_url": ragflow_url,
                "env_file": str(get_env_file_path())
            }
        )
    
    except Exception as e:
        logger.error(f"獲取配置失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取配置失敗: {str(e)}")


@router.post("/config")
async def update_config(request: ConfigUpdateRequest):
    """
    更新系統配置（API Keys）
    
    請求格式:
    {
        "dify_key": "app-xxxxxxxxxxxxxxxx",
        "ragflow_key": "ragflow-xxxxxxxxxxxxxxxx"
    }
    
    返回格式:
    {
        "success": true,
        "message": "配置更新成功",
        "config": {
            "dify_key": "app-x*****",
            "ragflow_key": "ragfl*****"
        }
    }
    """
    try:
        updates = {}
        
        # 準備要更新的變數
        if request.dify_key:
            updates['DIFY_API_KEY'] = request.dify_key
            logger.info("準備更新 DIFY_API_KEY")
        
        if request.ragflow_key:
            updates['RAGFLOW_API_KEY'] = request.ragflow_key
            logger.info("準備更新 RAGFLOW_API_KEY")
        
        if not updates:
            raise HTTPException(
                status_code=400, 
                detail="至少需要提供一個 API Key (dify_key 或 ragflow_key)"
            )
        
        # 更新 .env 檔案
        if not update_env_file(updates):
            raise HTTPException(status_code=500, detail="更新 .env 檔案失敗")
        
        # 嘗試即時生效（重新載入環境變數）
        reload_env_to_os()
        
        # 返回更新結果（遮蔽後的 Key）
        response_config = {}
        if request.dify_key:
            response_config['dify_key'] = mask_api_key(request.dify_key)
        if request.ragflow_key:
            response_config['ragflow_key'] = mask_api_key(request.ragflow_key)
        
        return ConfigResponse(
            success=True,
            message="配置更新成功。提示: 部分服務可能需要重啟才能完全生效",
            config=response_config
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新配置失敗: {e}")
        raise HTTPException(status_code=500, detail=f"更新配置失敗: {str(e)}")


@router.get("/env-file")
async def get_env_file_location():
    """
    獲取 .env 檔案位置和狀態
    
    返回格式:
    {
        "success": true,
        "path": "/path/to/.env",
        "exists": true,
        "writable": true
    }
    """
    try:
        env_path = get_env_file_path()
        exists = env_path.exists()
        writable = os.access(env_path.parent, os.W_OK) if exists else os.access(env_path.parent, os.W_OK)
        
        return {
            "success": True,
            "path": str(env_path),
            "exists": exists,
            "writable": writable
        }
    
    except Exception as e:
        logger.error(f"獲取 .env 檔案資訊失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取檔案資訊失敗: {str(e)}")
