"""
API 認證中間件
提供基於 API Token 的認證機制，防止未授權存取
"""
import os
import secrets
import hashlib
import json
import logging
from pathlib import Path
from typing import Optional
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

# Token 配置檔案路徑
TOKEN_FILE_PATH = Path("C:/BruV_Data/auth_token.json")

# 不需要認證的路徑白名單
PUBLIC_PATHS = {
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/health",
    "/api/auth/login",
    "/api/auth/status",
    "/",
}

# 不需要認證的路徑前綴
PUBLIC_PATH_PREFIXES = (
    "/assets/",     # 靜態資源
    "/favicon",     # 圖示
)


def _generate_token() -> str:
    """生成安全的隨機 Token"""
    return secrets.token_urlsafe(32)


def _hash_token(token: str) -> str:
    """對 Token 做 SHA-256 雜湊 (只存 hash，不存明文)"""
    return hashlib.sha256(token.encode()).hexdigest()


def _load_token_hash() -> Optional[str]:
    """從檔案讀取已保存的 Token Hash"""
    if TOKEN_FILE_PATH.exists():
        try:
            with open(TOKEN_FILE_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("token_hash")
        except Exception as e:
            logger.warning(f"讀取 Token 檔案失敗: {e}")
    return None


def _save_token_hash(token_hash: str) -> None:
    """保存 Token Hash 到檔案"""
    try:
        TOKEN_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump({"token_hash": token_hash}, f)
    except Exception as e:
        logger.error(f"保存 Token 檔案失敗: {e}")


def initialize_auth_token() -> str:
    """
    初始化認證 Token
    - 若已有 Token 且環境變數 BRUV_API_TOKEN 設定了，使用環境變數的值
    - 若已有 Token archive，驗證環境變數
    - 若完全沒有，自動生成並顯示在 console
    
    Returns:
        當前有效的 API Token
    """
    env_token = os.environ.get("BRUV_API_TOKEN")
    saved_hash = _load_token_hash()
    
    # 優先使用環境變數設定的 Token
    if env_token:
        new_hash = _hash_token(env_token)
        if saved_hash != new_hash:
            _save_token_hash(new_hash)
            logger.info("🔑 已更新 API Token (來自環境變數 BRUV_API_TOKEN)")
        return env_token
    
    # 如果已有保存的 hash，但沒有明文 Token -> 需要使用者設定
    if saved_hash:
        logger.info("🔑 API Token 認證已啟用 (使用已保存的 Token)")
        return ""  # 不知道明文 Token，但認證已啟用
    
    # 完全沒有 Token -> 自動生成
    new_token = _generate_token()
    _save_token_hash(_hash_token(new_token))
    
    logger.info("=" * 60)
    logger.info("🔑 首次啟動 - 已自動生成 API Token:")
    logger.info(f"   {new_token}")
    logger.info("   請妥善保存此 Token，它不會再次顯示！")
    logger.info("   可透過環境變數 BRUV_API_TOKEN 設定自訂 Token")
    logger.info("   前端登入時使用此 Token 作為密碼")
    logger.info("=" * 60)
    
    return new_token


def verify_token(token: str) -> bool:
    """驗證 Token 是否正確"""
    saved_hash = _load_token_hash()
    if not saved_hash:
        # 尚未設定 Token，允許存取 (首次使用場景)
        return True
    return _hash_token(token) == saved_hash


class APIAuthMiddleware(BaseHTTPMiddleware):
    """
    API 認證中間件
    
    驗證邏輯：
    1. 白名單路徑直接放行
    2. 檢查 Authorization header 或 x-api-token header
    3. Token 不正確返回 401
    """
    
    def __init__(self, app, enabled: bool = True):
        super().__init__(app)
        self.enabled = enabled
    
    async def dispatch(self, request: Request, call_next):
        # 認證未啟用時直接放行
        if not self.enabled:
            return await call_next(request)
        
        path = request.url.path
        
        # 白名單路徑放行
        if path in PUBLIC_PATHS:
            return await call_next(request)
        
        # 白名單前綴放行
        if path.startswith(PUBLIC_PATH_PREFIXES):
            return await call_next(request)
        
        # OPTIONS 請求放行 (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # 提取 Token
        token = self._extract_token(request)
        
        if not token:
            return JSONResponse(
                status_code=401,
                content={"detail": "未提供認證 Token。請在 Header 中加入 Authorization: Bearer <token>"}
            )
        
        if not verify_token(token):
            return JSONResponse(
                status_code=401,
                content={"detail": "認證 Token 無效"}
            )
        
        return await call_next(request)
    
    @staticmethod
    def _extract_token(request: Request) -> Optional[str]:
        """從請求中提取 Token"""
        # 方式 1: Authorization: Bearer <token>
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header[7:]
        
        # 方式 2: x-api-token header
        api_token = request.headers.get("x-api-token")
        if api_token:
            return api_token
        
        # 方式 3: URL query parameter (不建議，但方便開發測試)
        token_param = request.query_params.get("token")
        if token_param:
            return token_param
        
        return None
