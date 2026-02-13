"""
BruV_Project FastAPI 主程式
整合 Dify、RAGFlow 與 KuzuDB 知識圖譜
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging
import shutil
import os
from datetime import datetime

import httpx

from backend.api import dify_router, ragflow_router, graph_router, graph_import_router, system_router
from backend.api.tasks import router as tasks_router
from backend.api.media_library import router as media_library_router
from backend.core.kuzu_manager import KuzuDBManager, MockKuzuManager, AsyncKuzuWrapper
from backend.core.config import settings, get_current_api_keys
from backend.core.auth import (
    APIAuthMiddleware, initialize_auth_token, verify_token,
    add_token, revoke_token, list_tokens, update_user, get_token_label
)
from backend.services.watcher import WatcherService
from backend.services.task_queue import task_queue
from backend.core.logging import (
    setup_structured_logging,
    RequestTracingMiddleware,
    request_id_var,
)
from backend.core.telemetry import setup_opentelemetry
from backend.rag_client import RAGFlowClient

# ==================== Pydantic 模型 ====================

class EntityCreate(BaseModel):
    """創建實體請求模型"""
    id: str
    name: str
    type: str
    description: Optional[str] = ""
    properties: Optional[Dict[str, Any]] = {}
    graph_id: Optional[str] = "1"  # 所屬圖譜 ID，預設為主腦圖譜

class EntityResponse(BaseModel):
    """實體響應模型"""
    success: bool
    message: str
    entity_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class BatchEntityCreate(BaseModel):
    """批量創建實體請求模型"""
    entities: list[EntityCreate]

# 結構化日誌配置
# 生產模式: JSON 格式 (json_format=True)
# 開發模式: 人類可讀 (json_format=False)
_is_debug = os.environ.get("DEBUG", "false").lower() == "true"
setup_structured_logging(
    level=os.environ.get("LOG_LEVEL", "DEBUG" if _is_debug else "INFO"),
    json_format=not _is_debug,
)
logger = logging.getLogger(__name__)


# ==================== Lifespan（取代已棄用的 @app.on_event） ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用生命週期管理：啟動時初始化資源，關閉時釋放"""
    logger.info("BruV_Project 啟動中...")

    # -- 啟動後台任務隊列 --
    await task_queue.start_worker()
    logger.info("任務隊列已就緒")

    # -- 共享 httpx 連線池（H-04） --
    app.state.http_client = httpx.AsyncClient(
        timeout=settings.REQUEST_TIMEOUT,
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=10),
    )

    # -- 初始化 KuzuDB (with AsyncKuzuWrapper for concurrency safety) --
    kuzu_manager = None
    try:
        raw_manager = KuzuDBManager(settings.KUZU_DB_PATH)
        kuzu_manager = AsyncKuzuWrapper(raw_manager)
        logger.info("KuzuDB 初始化成功（生產模式 + AsyncKuzuWrapper 併發安全）")
    except Exception as e:
        logger.warning(f"KuzuDB 初始化失敗: {e}")
        try:
            kuzu_manager = MockKuzuManager(settings.KUZU_DB_PATH)
            logger.info("MockKuzuManager 初始化成功（開發模式）")
        except Exception as mock_error:
            logger.error(f"MockKuzuManager 初始化也失敗: {mock_error}")
    app.state.kuzu_manager = kuzu_manager

    # -- 初始化資料夾監控服務 --
    watcher_service = None
    try:
        api_keys = get_current_api_keys()
        rag_api_key = api_keys['RAGFLOW_API_KEY']
        DEFAULT_DATASET_ID = "9de22384ff0e11f09a1f8f43565b28f4"

        monitor_path = settings.AUTO_IMPORT_DIR

        if not rag_api_key:
            logger.warning("RAGFlow API Key 未配置，監控服務將無法上傳檔案")
        else:
            os.makedirs(monitor_path, exist_ok=True)

            ragflow_base = api_keys['RAGFLOW_API_URL']  # 直接使用 config URL (e.g. http://localhost:9380/api/v1)

            rag_client = RAGFlowClient(api_key=rag_api_key, base_url=ragflow_base)
            watcher_service = WatcherService(
                rag_client=rag_client,
                kuzu_manager=kuzu_manager,
                dataset_id=DEFAULT_DATASET_ID,
            )
            watcher_service.start(monitor_path)
            logger.info(f"資料夾監控已啟動: {monitor_path}")
    except Exception as e:
        logger.error(f"資料夾監控服務啟動失敗: {e}")
    app.state.watcher_service = watcher_service

    logger.info(f"Dify API: {settings.DIFY_API_URL}")
    logger.info(f"RAGFlow API: {settings.RAGFLOW_API_URL}")
    logger.info("服務已就緒")

    yield  # ← 應用運行中

    # ---------- 關閉流程 ----------
    logger.info("BruV_Project 關閉中...")
    await task_queue.stop_worker()

    if app.state.watcher_service:
        try:
            app.state.watcher_service.stop()
        except Exception as e:
            logger.error(f"停止監控服務時發生錯誤: {e}")

    if app.state.kuzu_manager:
        app.state.kuzu_manager.close()
        logger.info("KuzuDB 連接已關閉")

    await app.state.http_client.aclose()
    logger.info("httpx 連線池已關閉")


# 初始化 FastAPI（使用 lifespan 取代已棄用的 on_event）
app = FastAPI(
    title="BruV Project API",
    description="企業級 AI 服務整合平台 (Dify + RAGFlow + KuzuDB)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# OpenTelemetry 自動儀器化 (在 app 建立後)
# 設定 OTEL_ENABLED=true 以啟用分散式追蹤
if os.environ.get("OTEL_ENABLED", "false").lower() == "true":
    setup_opentelemetry(app=app)

# CORS 配置 - 允許已知的前端來源 + 區網 IP
_cors_origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# 可透過環境變數新增額外來源（逗號分隔）
_extra_origins = os.environ.get("CORS_ORIGINS", "")
if _extra_origins:
    _cors_origins.extend([o.strip() for o in _extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # 允許 192.168.x.x 區網任意 port 的前端存取
    allow_origin_regex=r"^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID 追蹤中間件 — 為每個 HTTP 請求注入 X-Request-ID
app.add_middleware(RequestTracingMiddleware)

# API 認證中間件（地端化伺服器安全防護）
# 設定 BRUV_AUTH_ENABLED=false 環境變數可停用認證（僅供開發）
auth_enabled = os.environ.get("BRUV_AUTH_ENABLED", "true").lower() != "false"
if settings.BRUV_AUTH_ENABLED is False:
    auth_enabled = False

# 確保 .env 中的 BRUV_API_TOKEN 可被 auth 模組讀取
# (Pydantic BaseSettings 讀取 .env 但不注入 os.environ)
if settings.BRUV_API_TOKEN and not os.environ.get("BRUV_API_TOKEN"):
    os.environ["BRUV_API_TOKEN"] = settings.BRUV_API_TOKEN

app.add_middleware(APIAuthMiddleware, enabled=auth_enabled)

if auth_enabled:
    api_token = initialize_auth_token()
else:
    logger.warning("API 認證已停用（BRUV_AUTH_ENABLED=false），請勿在生產環境使用！")
    api_token = None


# ==================== 認證 API ====================

class LoginRequest(BaseModel):
    """登入請求"""
    token: str

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """驗證 API Token 並返回認證狀態"""
    if verify_token(request.token):
        return {"success": True, "message": "認證成功"}
    raise HTTPException(status_code=401, detail="Token 無效")

@app.get("/api/auth/status")
async def auth_status():
    """檢查認證是否啟用"""
    return {"auth_enabled": auth_enabled}


# ==================== 使用者管理 API ====================

class CreateUserRequest(BaseModel):
    """建立使用者請求"""
    username: str
    password: str
    role: str = "user"
    dify_api_key: str = ""

class UpdateUserRequest(BaseModel):
    """更新使用者請求"""
    password: Optional[str] = None
    role: Optional[str] = None
    dify_api_key: Optional[str] = None

@app.get("/api/auth/users")
async def get_users():
    """列出所有使用者"""
    return {"success": True, "users": list_tokens()}

@app.post("/api/auth/users")
async def create_user(request: CreateUserRequest):
    """建立新使用者（帳號+密碼+Dify Key）"""
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="使用者名稱與密碼不可為空")
    if len(request.password) < 4:
        raise HTTPException(status_code=400, detail="密碼至少 4 碼")
    ok = add_token(request.username, request.password, request.role, request.dify_api_key)
    if not ok:
        raise HTTPException(status_code=409, detail=f"使用者 '{request.username}' 已存在")
    return {"success": True, "message": f"使用者 '{request.username}' 已建立"}

@app.put("/api/auth/users/{username}")
async def edit_user(username: str, request: UpdateUserRequest):
    """更新使用者的密碼 / 角色 / Dify Key"""
    ok = update_user(username, request.password, request.role, request.dify_api_key)
    if not ok:
        raise HTTPException(status_code=404, detail=f"找不到使用者 '{username}'")
    return {"success": True, "message": f"使用者 '{username}' 已更新"}

@app.delete("/api/auth/users/{username}")
async def delete_user(username: str):
    """刪除使用者"""
    if username == "admin":
        raise HTTPException(status_code=403, detail="不可刪除 admin 帳號")
    ok = revoke_token(username)
    if not ok:
        raise HTTPException(status_code=404, detail=f"找不到使用者 '{username}'")
    return {"success": True, "message": f"使用者 '{username}' 已刪除"}


# 健康檢查
@app.get("/api/health")
async def health_check(request: Request):
    """服務健康檢查"""
    km = getattr(request.app.state, 'kuzu_manager', None)
    kuzu_status = "connected" if km else "unavailable"
    return {
        "status": "healthy",
        "services": {
            "fastapi": "running",
            "kuzu": kuzu_status,
            "dify": settings.DIFY_API_URL,
            "ragflow": settings.RAGFLOW_API_URL
        },
        "message": "KuzuDB 圖譜功能可能因 Windows 編碼問題而不可用" if not km else None
    }


# 根路由
@app.get("/")
async def root():
    """返回前端首頁"""
    frontend_path = Path(__file__).parent / "frontend" / "index.html"
    if frontend_path.exists():
        return FileResponse(frontend_path)
    return {"message": "BruV_Project API is running", "docs": "/docs"}


# ==================== 知識圖譜 API 端點 ====================

# 注册任务管理 API
app.include_router(tasks_router)

@app.post("/api/graph/create", response_model=EntityResponse)
async def create_entity_endpoint(request: Request, entity: EntityCreate):
    """創建單個實體節點"""
    try:
        kuzu_manager = getattr(request.app.state, 'kuzu_manager', None)
        # 檢查 KuzuDB 是否可用
        if not kuzu_manager:
            return EntityResponse(
                success=False,
                message="知識圖譜服務暫時不可用 (使用 Mock 模式或 KuzuDB 未初始化)",
                entity_id=None,
                data={"mode": "unavailable", "note": "功能受限，請檢查 KuzuDB 配置"}
            )
        
        # 判斷是否為 Mock 模式
        is_mock_mode = isinstance(kuzu_manager, MockKuzuManager)
        
        # 調用 KuzuDB 管理器創建實體
        success = kuzu_manager.add_entity(
            entity_id=entity.id,
            name=entity.name,
            entity_type=entity.type,
            properties=entity.properties or {},
            graph_id=entity.graph_id or "1"
        )
        
        if success:
            mode_label = "[Mock 模式]" if is_mock_mode else "[生產模式]"
            logger.info(f"✅ {mode_label} 創建實體成功: {entity.id} - {entity.name}")
            return EntityResponse(
                success=True,
                message=f"實體 '{entity.name}' 創建成功 {'(Mock 模式 - 記憶體存儲)' if is_mock_mode else ''}",
                entity_id=entity.id,
                data={
                    "id": entity.id,
                    "name": entity.name,
                    "type": entity.type,
                    "description": entity.description,
                    "mode": "mock" if is_mock_mode else "production"
                }
            )
        else:
            logger.error(f"❌ 創建實體失敗: {entity.id}")
            raise HTTPException(status_code=500, detail="創建實體失敗")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 創建實體時發生錯誤: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"創建實體時發生錯誤: {str(e)}")


@app.post("/api/graph/batch-create", response_model=EntityResponse)
async def batch_create_entities(request: Request, batch: BatchEntityCreate):
    """批量創建實體節點"""
    try:
        kuzu_manager = getattr(request.app.state, 'kuzu_manager', None)
        if not kuzu_manager:
            return EntityResponse(
                success=False,
                message="知識圖譜服務暫時不可用",
                data={"mode": "unavailable"}
            )
        
        is_mock_mode = isinstance(kuzu_manager, MockKuzuManager)
        success_count = 0
        failed_count = 0
        
        for entity in batch.entities:
            try:
                success = kuzu_manager.add_entity(
                    entity_id=entity.id,
                    name=entity.name,
                    entity_type=entity.type,
                    properties=entity.properties or {},
                    graph_id=entity.graph_id or "1"
                )
                if success:
                    success_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"批量創建實體失敗: {entity.id} - {e}")
                failed_count += 1
        
        mode_info = " (Mock 模式 - 記憶體存儲)" if is_mock_mode else ""
        return EntityResponse(
            success=True,
            message=f"批量創建完成{mode_info}: 成功 {success_count} 個，失敗 {failed_count} 個",
            data={
                "success_count": success_count,
                "failed_count": failed_count,
                "total": len(batch.entities),
                "mode": "mock" if is_mock_mode else "production"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量創建時發生錯誤: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"批量創建失敗: {str(e)}")


@app.get("/api/graph/data")
async def get_graph_data(request: Request, graph_id: str = "1"):
    """
    獲取知識圖譜數據（節點與連結）
    用於 3D/2D 視覺化渲染
    
    Args:
        graph_id: 圖譜 ID (1: 主腦圖譜, graph_xxx: 用戶創建的圖譜)
    
    Returns:
        包含 nodes 和 links 的 JSON 數據
    """
    import json
    
    kuzu_manager = getattr(request.app.state, 'kuzu_manager', None)
    logger.info(f"請求圖譜數據: graph_id={graph_id}")
    
    # 檢查 KuzuDB 是否可用
    if not kuzu_manager:
        logger.warning("⚠️ KuzuDB 不可用，返回空數據")
        return {
            "success": False,
            "data": {
                "nodes": [],
                "links": [],
                "metadata": {
                    "total_nodes": 0,
                    "total_links": 0,
                    "source": "unavailable",
                    "graph_id": graph_id,
                    "note": "KuzuDB 未初始化，無法獲取圖譜數據"
                }
            }
        }
    
    try:
        logger.info(f"📊 正在從 KuzuDB 查詢圖譜數據 (graph_id={graph_id})...")
        
        # 根據 graph_id 過濾數據
        # 主腦圖譜 (ID=1): 查詢所有 graph_id 為空或等於 '1' 的節點
        # 用戶圖譜: 只查詢對應 graph_id 的節點
        if str(graph_id) == "1":
            # 主腦圖譜：查詢所有未標記圖譜ID或標記為1的節點
            nodes_query = "MATCH (n:Entity) WHERE n.graph_id IS NULL OR n.graph_id = '1' RETURN n"
            links_query = "MATCH (a:Entity)-[r:Relation]->(b:Entity) WHERE (a.graph_id IS NULL OR a.graph_id = '1') AND (b.graph_id IS NULL OR b.graph_id = '1') RETURN a, r, b"
            nodes_result = kuzu_manager.query(nodes_query)
            links_result = kuzu_manager.query(links_query)
        else:
            # 用戶創建的圖譜：使用參數化查詢防止 Cypher 注入
            nodes_query = "MATCH (n:Entity) WHERE n.graph_id = $gid RETURN n"
            links_query = "MATCH (a:Entity)-[r:Relation]->(b:Entity) WHERE a.graph_id = $gid AND b.graph_id = $gid RETURN a, r, b"
            nodes_result = kuzu_manager.query(nodes_query, parameters={"gid": graph_id})
            links_result = kuzu_manager.query(links_query, parameters={"gid": graph_id})
        
        # 轉換節點數據
        nodes = []
        node_type_count = {}
        
        for row in nodes_result:
            try:
                node_data = row.get('n', {})
                
                # 提取節點基本資訊
                node_id = node_data.get('id', '')
                node_name = node_data.get('name', 'Unknown')
                node_type = node_data.get('type', 'Unknown')
                
                # 解析 properties 字串為 JSON（如果是字串的話）
                properties_str = node_data.get('properties', '{}')
                try:
                    if isinstance(properties_str, str):
                        properties = json.loads(properties_str.replace("'", '"'))
                    else:
                        properties = properties_str
                except (json.JSONDecodeError, AttributeError):
                    properties = {}
                
                # 根據類型分配 group（用於顏色分類）
                type_to_group = {
                    'Person': 1,
                    'Company': 2,
                    'Concept': 3,
                    'document': 4,
                    'Document': 4,
                }
                group = type_to_group.get(node_type, 5)
                
                # 統計節點類型
                node_type_count[node_type] = node_type_count.get(node_type, 0) + 1
                
                # 構建節點對象（將 properties 中的常用欄位提升到頂層）
                node = {
                    "id": node_id,
                    "name": node_name,
                    "type": node_type,
                    "group": group,
                    "val": 10,  # 預設大小
                    "link": properties.get("link", ""),
                    "description": properties.get("description", ""),
                    "image": properties.get("image", ""),
                    "color": properties.get("color", ""),
                    "size": 10,  # 統一節點大小
                    "properties": properties
                }
                
                nodes.append(node)
                
            except Exception as e:
                logger.error(f"❌ 解析節點數據失敗: {e}")
                continue
        
        # 轉換關係數據
        links = []
        
        for row in links_result:
            try:
                source_node = row.get('a', {})
                target_node = row.get('b', {})
                relation = row.get('r', {})
                
                # 提取關係資訊
                source_id = source_node.get('id', '')
                target_id = target_node.get('id', '')
                relation_type = relation.get('relation_type', 'relates_to')
                
                # 構建連結對象
                link = {
                    "source": source_id,
                    "target": target_id,
                    "label": relation_type,
                    "value": 1
                }
                
                links.append(link)
                
            except Exception as e:
                logger.error(f"❌ 解析關係數據失敗: {e}")
                continue
        
        logger.info(f"✅ 成功查詢圖譜數據: {len(nodes)} 個節點, {len(links)} 條連結")
        
        return {
            "success": True,
            "data": {
                "nodes": nodes,
                "links": links,
                "metadata": {
                    "total_nodes": len(nodes),
                    "total_links": len(links),
                    "node_types": node_type_count,
                    "source": "kuzu_db",
                    "graph_id": graph_id,
                    "note": f"從 KuzuDB 載入圖譜 {graph_id}"
                }
            }
        }
        
    except Exception as e:
        logger.error(f"❌ 獲取圖譜數據失敗: {e}", exc_info=True)
        
        # 返回空數據而不是拋出異常
        return {
            "success": False,
            "data": {
                "nodes": [],
                "links": [],
                "metadata": {
                    "total_nodes": 0,
                    "total_links": 0,
                    "source": "error",
                    "note": f"查詢失敗: {str(e)}"
                }
            }
        }


# 註冊 API 路由
# (舊版 /api/system/upload 已移除，統一由 system_router 處理，支援 RAGFlow 上傳)

app.include_router(dify_router, prefix="/api/dify", tags=["Dify"])
app.include_router(ragflow_router, prefix="/api/ragflow", tags=["RAGFlow"])
app.include_router(graph_router, prefix="/api/graph", tags=["Knowledge Graph"])
app.include_router(graph_import_router, prefix="/api/graph", tags=["Graph Import"])
app.include_router(system_router, prefix="/api/system", tags=["System"])
app.include_router(media_library_router, prefix="/api/media", tags=["Media Library"])


# ==================== 靜態文件服務 (frontend/dist) ====================
_DIST_DIR = Path(__file__).parent / "frontend" / "dist"
_INDEX_HTML = _DIST_DIR / "index.html"

if _DIST_DIR.exists():
    # assets (JS/CSS/圖片) 透過 /assets 路徑掛載
    _assets_dir = _DIST_DIR / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    # SPA fallback: 非 /api 路徑回傳 index.html
    from starlette.responses import FileResponse

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        """SPA 前端路由 fallback — 非 API / 非靜態資源回傳 index.html"""
        # 嘗試靜態檔案 (favicon.ico, robots.txt 等)
        static_file = _DIST_DIR / full_path
        if full_path and static_file.exists() and static_file.is_file():
            return FileResponse(str(static_file))
        # 其它全部回傳 index.html (Vue Router 處理)
        if _INDEX_HTML.exists():
            return FileResponse(str(_INDEX_HTML))
        return JSONResponse(status_code=404, content={"error": "前端尚未建構，請執行 npm run build"})

    logger.info(f"✅ 前端靜態檔案已掛載: {_DIST_DIR}")
else:
    logger.warning(f"⚠️ 前端 dist 目錄不存在: {_DIST_DIR}，請先執行 cd frontend && npm run build")


# 全域異常處理
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """統一 HTTP 異常處理"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """統一一般異常處理"""
    logger.error(f"未處理的異常: {exc}", exc_info=True)
    # 不洩漏內部錯誤詳情給客戶端
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    return JSONResponse(
        status_code=500,
        content={
            "error": "內部伺服器錯誤",
            "detail": str(exc) if debug else "請聯繫管理員或查看伺服器日誌",
            "path": str(request.url)
        }
    )


if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("BRUV_HOST", "127.0.0.1")
    port = int(os.environ.get("BRUV_PORT", "8000"))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    uvicorn.run(
        "app_anytype:app",
        host=host,
        port=port,
        reload=debug  # 僅開發模式啟用 auto-reload
    )
