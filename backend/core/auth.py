"""
API 認證中間件
提供基於 API Token 的認證機制，防止未授權存取
支援多組 Token 發放（多使用者 / 多服務場景）
"""
import os
import secrets
import hashlib
import json
import logging
import time
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

# Token 配置檔案路徑（與 config.py 統一使用 BRUV_DATA_DIR）
_DATA_DIR = Path(os.environ.get("BRUV_DATA_DIR", str(Path.home() / "BruV_Data")))
TOKEN_FILE_PATH = _DATA_DIR / "auth_token.json"

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


# ==================== Token Store 快取 (v5.3) ====================
# 避免每次 API 請求都讀取磁碟檔案，使用 in-memory cache + TTL 30 秒
_token_store_cache: Optional[Dict] = None
_token_store_cache_time: float = 0.0
_TOKEN_CACHE_TTL: float = 30.0  # 秒
_token_cache_lock = threading.Lock()


def _invalidate_token_cache() -> None:
    """寫入操作後清除快取，確保下次讀取會從磁碟重新載入"""
    global _token_store_cache, _token_store_cache_time
    with _token_cache_lock:
        _token_store_cache = None
        _token_store_cache_time = 0.0


# ==================== 多 Token 儲存格式 ====================
# {
#   "tokens": [
#     {"user": "admin", "hash": "<sha256>", "role": "admin", "created_at": "..."},
#     {"user": "guest", "hash": "<sha256>", "role": "user",  "created_at": "..."}
#   ]
# }
# 向後相容：自動遷移舊 dict 格式 / 單一 token_hash 格式


def _load_token_store() -> Dict:
    """讀取完整的 Token 儲存，含 in-memory 快取 (TTL 30s)，自動遷移舊格式"""
    global _token_store_cache, _token_store_cache_time
    now = time.monotonic()
    with _token_cache_lock:
        if _token_store_cache is not None and (now - _token_store_cache_time) < _TOKEN_CACHE_TTL:
            return _token_store_cache
    if not TOKEN_FILE_PATH.exists():
        return {"tokens": []}
    try:
        with open(TOKEN_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        tokens = data.get("tokens")

        # ── 格式 A (最舊)：只有 token_hash，沒有 tokens ──
        if tokens is None and "token_hash" in data:
            migrated = {
                "tokens": [{
                    "user": "admin",
                    "hash": data["token_hash"],
                    "role": "admin",
                    "created_at": datetime.now().isoformat(),
                }]
            }
            _save_token_store(migrated)
            logger.info("🔑 已將單一 hash 格式遷移至多用戶陣列格式")
            return migrated

        # ── 格式 B (中間)：tokens 是 dict {"admin": {"hash": ...}} ──
        if isinstance(tokens, dict):
            arr = []
            for label, entry in tokens.items():
                arr.append({
                    "user": label,
                    "hash": entry.get("hash", ""),
                    "role": entry.get("role", "user"),
                    "created_at": entry.get("created_at", datetime.now().isoformat()),
                })
            migrated = {"tokens": arr}
            _save_token_store(migrated)
            logger.info(f"🔑 已將 dict 格式遷移至陣列格式 ({len(arr)} 組)")
            return migrated

        # ── 格式 C (新)：tokens 是 list ──
        if isinstance(tokens, list):
            with _token_cache_lock:
                _token_store_cache = data
                _token_store_cache_time = time.monotonic()
            return data

        return {"tokens": []}
    except Exception as e:
        logger.warning(f"讀取 Token 檔案失敗: {e}")
        return {"tokens": []}


def _save_token_store(store: Dict) -> None:
    """保存完整的 Token 儲存，並清除快取"""
    try:
        TOKEN_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(store, f, ensure_ascii=False, indent=2)
        _invalidate_token_cache()
    except Exception as e:
        logger.error(f"保存 Token 檔案失敗: {e}")


def _load_token_hash() -> Optional[str]:
    """從檔案讀取已保存的 (主) Token Hash"""
    store = _load_token_store()
    tokens = store.get("tokens", [])
    if tokens and isinstance(tokens, list):
        return tokens[0].get("hash")
    return None


def _save_token_hash(token_hash: str) -> None:
    """保存 Token Hash — 更新或新建 admin 項目"""
    store = _load_token_store()
    tokens = store.get("tokens", [])
    # 更新已存在的 admin
    for entry in tokens:
        if entry.get("user") == "admin":
            entry["hash"] = token_hash
            _save_token_store(store)
            return
    # 不存在 admin → 新增
    tokens.insert(0, {
        "user": "admin",
        "hash": token_hash,
        "role": "admin",
        "created_at": datetime.now().isoformat(),
    })
    store["tokens"] = tokens
    _save_token_store(store)


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
    """驗證 Token 是否正確（遍歷 hash 清單）"""
    store = _load_token_store()
    tokens = store.get("tokens", [])

    if not tokens:
        # 尚未設定任何 Token，允許存取 (首次使用場景)
        return True

    incoming_hash = _hash_token(token)
    return any(entry.get("hash") == incoming_hash for entry in tokens)


def get_token_label(token: str) -> Optional[str]:
    """根據 Token 取得其使用者名稱（用於審計日誌）"""
    store = _load_token_store()
    incoming_hash = _hash_token(token)
    for entry in store.get("tokens", []):
        if entry.get("hash") == incoming_hash:
            return entry.get("user")
    return None


# ==================== 多 Token 管理 API 工具函式 ====================

def add_token(label: str, token: str, role: str = "user", dify_api_key: str = "") -> bool:
    """
    新增一組 Token

    Args:
        label: 使用者名稱 (如 "alice", "service_etl")
        token: 明文 Token (只在此處使用，不會被保存)
        role:  角色 — admin / user / service
        dify_api_key: 該用戶專屬的 Dify API Key

    Returns:
        True 成功, False 使用者名稱已存在
    """
    store = _load_token_store()
    tokens = store.get("tokens", [])
    if any(entry.get("user") == label for entry in tokens):
        return False  # 使用者名稱已存在

    tokens.append({
        "user": label,
        "hash": _hash_token(token),
        "role": role,
        "dify_api_key": dify_api_key,
        "created_at": datetime.now().isoformat(),
    })
    store["tokens"] = tokens
    _save_token_store(store)
    logger.info(f"🔑 已新增 Token [{label}] (role={role})")
    return True


def revoke_token(label: str) -> bool:
    """撤銷指定使用者的 Token"""
    store = _load_token_store()
    tokens = store.get("tokens", [])
    original_len = len(tokens)

    store["tokens"] = [e for e in tokens if e.get("user") != label]
    if len(store["tokens"]) == original_len:
        return False  # 找不到該使用者

    _save_token_store(store)
    logger.info(f"🔑 已撤銷 Token [{label}]")
    return True


def list_tokens() -> List[Dict]:
    """列出所有已發放的 Token (不含完整 hash)"""
    store = _load_token_store()
    result = []
    for entry in store.get("tokens", []):
        dify_key = entry.get("dify_api_key", "")
        result.append({
            "user": entry.get("user", "unknown"),
            "role": entry.get("role", "user"),
            "created_at": entry.get("created_at", "-"),
            "hash_prefix": entry.get("hash", "")[:8] + "...",
            "has_dify_key": bool(dify_key),
            "dify_key_preview": (dify_key[:8] + "...") if dify_key else "",
        })
    return result


def get_user_dify_key(token: str) -> Optional[str]:
    """根據 Token 取得該用戶專屬的 Dify API Key"""
    store = _load_token_store()
    incoming_hash = _hash_token(token)
    for entry in store.get("tokens", []):
        if entry.get("hash") == incoming_hash:
            return entry.get("dify_api_key") or None
    return None


def update_user(label: str, password: Optional[str] = None, role: Optional[str] = None, dify_api_key: Optional[str] = None) -> bool:
    """更新指定用戶的資訊"""
    store = _load_token_store()
    tokens = store.get("tokens", [])
    for entry in tokens:
        if entry.get("user") == label:
            if password is not None:
                entry["hash"] = _hash_token(password)
            if role is not None:
                entry["role"] = role
            if dify_api_key is not None:
                entry["dify_api_key"] = dify_api_key
            _save_token_store(store)
            logger.info(f"🔑 已更新用戶 [{label}]")
            return True
    return False


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

        # 非 API 路徑放行 (前端 SPA 頁面 / 靜態資源)
        if not path.startswith("/api/"):
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
        
        # 方式 3: URL query parameter — 已移除
        # Token 會出現在日誌、Referer header、瀏覽器歷史中，存在安全風險
        
        return None
