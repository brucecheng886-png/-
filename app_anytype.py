"""
BruV_Project FastAPI 主程式
整合 Dify、RAGFlow 與 KuzuDB 知識圖譜
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any
import logging

from backend.api import dify_router, ragflow_router, graph_router, graph_import_router, system_router
from backend.core.kuzu_manager import KuzuDBManager, MockKuzuManager
from backend.core.config import settings

# ==================== Pydantic 模型 ====================

class EntityCreate(BaseModel):
    """創建實體請求模型"""
    id: str
    name: str
    type: str
    description: Optional[str] = ""
    properties: Optional[Dict[str, Any]] = {}

class EntityResponse(BaseModel):
    """實體響應模型"""
    success: bool
    message: str
    entity_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class BatchEntityCreate(BaseModel):
    """批量創建實體請求模型"""
    entities: list[EntityCreate]

# 日誌配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 初始化 FastAPI
app = FastAPI(
    title="BruV Project API",
    description="企業級 AI 服務整合平台 (Dify + RAGFlow + KuzuDB)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 配置 - 允許前端跨域請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "*"  # 開發環境允許所有來源
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全域變數
kuzu_manager = None


# 生命週期事件
@app.on_event("startup")
async def startup_event():
    """應用啟動時初始化"""
    global kuzu_manager
    
    logger.info("🚀 BruV_Project 啟動中...")
    
    # 初始化 KuzuDB（失敗時自動切換到 Mock 模式）
    try:
        logger.info("嘗試初始化真實 KuzuDB...")
        kuzu_manager = KuzuDBManager(settings.KUZU_DB_PATH)
        logger.info("✅ KuzuDB 初始化成功（生產模式）")
    except Exception as e:
        logger.warning(f"⚠️ KuzuDB 初始化失敗: {e}")
        logger.info("🔄 自動切換到 MockKuzuManager（開發模式）")
        try:
            kuzu_manager = MockKuzuManager(settings.KUZU_DB_PATH)
            logger.info("✅ MockKuzuManager 初始化成功（圖譜功能使用記憶體模式）")
        except Exception as mock_error:
            logger.error(f"❌ MockKuzuManager 初始化也失敗: {mock_error}")
            kuzu_manager = None
    
    # 檢查外部服務連接
    logger.info(f"🔗 Dify API: {settings.DIFY_API_URL}")
    logger.info(f"🔗 RAGFlow API: {settings.RAGFLOW_API_URL}")
    
    logger.info("✨ 服務已就緒")


@app.on_event("shutdown")
async def shutdown_event():
    """應用關閉時清理"""
    global kuzu_manager
    
    logger.info("👋 BruV_Project 關閉中...")
    
    if kuzu_manager:
        kuzu_manager.close()
        logger.info("✅ KuzuDB 連接已關閉")


# 健康檢查
@app.get("/api/health")
async def health_check():
    """服務健康檢查"""
    kuzu_status = "connected" if kuzu_manager else "unavailable"
    return {
        "status": "healthy",
        "services": {
            "fastapi": "running",
            "kuzu": kuzu_status,
            "dify": settings.DIFY_API_URL,
            "ragflow": settings.RAGFLOW_API_URL
        },
        "message": "KuzuDB 圖譜功能可能因 Windows 編碼問題而不可用" if not kuzu_manager else None
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

@app.post("/api/graph/create", response_model=EntityResponse)
async def create_entity_endpoint(entity: EntityCreate):
    """創建單個實體節點"""
    try:
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
            properties=entity.properties or {}
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
async def batch_create_entities(batch: BatchEntityCreate):
    """批量創建實體節點"""
    try:
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
                    properties=entity.properties or {}
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
async def get_graph_data():
    """
    獲取知識圖譜數據（節點與連結）
    用於 3D/2D 視覺化渲染
    
    Returns:
        包含 nodes 和 links 的 JSON 數據
    """
    try:
        # TODO: 階段二 - 集成真實數據源
        # 1. 優先從 RAGFlow GraphRAG API 獲取: GET /v1/api/graph
        # 2. 或直接查詢 KuzuDB: SELECT * FROM Entity, Relationship
        # 3. 轉換成標準格式: {nodes: [...], links: [...]}
        
        # 階段一：返回豐富的 Mock Data
        logger.info("📊 返回 Mock 圖譜數據（待集成 RAGFlow/KuzuDB）")
        
        # 生成模擬數據 - 3 種類型的節點
        mock_nodes = []
        mock_links = []
        
        # Person 節點 (藍色)
        persons = [
            {"id": "p1", "name": "張三", "type": "Person", "group": 1, "val": 15},
            {"id": "p2", "name": "李四", "type": "Person", "group": 1, "val": 12},
            {"id": "p3", "name": "王五", "type": "Person", "group": 1, "val": 10},
            {"id": "p4", "name": "趙六", "type": "Person", "group": 1, "val": 8},
            {"id": "p5", "name": "陳七", "type": "Person", "group": 1, "val": 14},
        ]
        
        # Company 節點 (紫色)
        companies = [
            {"id": "c1", "name": "科技公司A", "type": "Company", "group": 2, "val": 20},
            {"id": "c2", "name": "軟體公司B", "type": "Company", "group": 2, "val": 18},
            {"id": "c3", "name": "AI 研究院", "type": "Company", "group": 2, "val": 22},
            {"id": "c4", "name": "創投基金", "type": "Company", "group": 2, "val": 16},
        ]
        
        # Concept 節點 (綠色)
        concepts = [
            {"id": "k1", "name": "機器學習", "type": "Concept", "group": 3, "val": 25},
            {"id": "k2", "name": "知識圖譜", "type": "Concept", "group": 3, "val": 20},
            {"id": "k3", "name": "自然語言處理", "type": "Concept", "group": 3, "val": 18},
            {"id": "k4", "name": "GraphRAG", "type": "Concept", "group": 3, "val": 22},
            {"id": "k5", "name": "向量資料庫", "type": "Concept", "group": 3, "val": 15},
            {"id": "k6", "name": "Prompt Engineering", "type": "Concept", "group": 3, "val": 12},
        ]
        
        # 合併所有節點
        mock_nodes = persons + companies + concepts
        
        # 生成連結關係
        mock_links = [
            # 人與公司的關係
            {"source": "p1", "target": "c1", "label": "就職於", "value": 1},
            {"source": "p2", "target": "c1", "label": "就職於", "value": 1},
            {"source": "p3", "target": "c2", "label": "就職於", "value": 1},
            {"source": "p4", "target": "c3", "label": "就職於", "value": 1},
            {"source": "p5", "target": "c4", "label": "投資顧問", "value": 1},
            
            # 人與概念的關係
            {"source": "p1", "target": "k1", "label": "研究領域", "value": 1},
            {"source": "p1", "target": "k2", "label": "專長", "value": 1},
            {"source": "p2", "target": "k3", "label": "研究領域", "value": 1},
            {"source": "p3", "target": "k4", "label": "專長", "value": 1},
            {"source": "p4", "target": "k1", "label": "研究領域", "value": 1},
            {"source": "p4", "target": "k5", "label": "專長", "value": 1},
            {"source": "p5", "target": "k6", "label": "關注", "value": 1},
            
            # 公司與概念的關係
            {"source": "c1", "target": "k1", "label": "技術棧", "value": 2},
            {"source": "c1", "target": "k2", "label": "技術棧", "value": 2},
            {"source": "c2", "target": "k3", "label": "核心技術", "value": 2},
            {"source": "c2", "target": "k6", "label": "服務項目", "value": 2},
            {"source": "c3", "target": "k1", "label": "研究方向", "value": 2},
            {"source": "c3", "target": "k4", "label": "研究方向", "value": 2},
            {"source": "c4", "target": "k5", "label": "投資領域", "value": 2},
            
            # 概念之間的關係
            {"source": "k1", "target": "k2", "label": "相關技術", "value": 1},
            {"source": "k1", "target": "k3", "label": "相關技術", "value": 1},
            {"source": "k2", "target": "k4", "label": "演進技術", "value": 1},
            {"source": "k3", "target": "k6", "label": "應用場景", "value": 1},
            {"source": "k4", "target": "k5", "label": "技術依賴", "value": 1},
            
            # 人與人的關係
            {"source": "p1", "target": "p2", "label": "同事", "value": 1},
            {"source": "p3", "target": "p1", "label": "合作", "value": 1},
            {"source": "p4", "target": "p1", "label": "學術交流", "value": 1},
            
            # 公司之間的關係
            {"source": "c1", "target": "c3", "label": "合作夥伴", "value": 2},
            {"source": "c2", "target": "c3", "label": "技術合作", "value": 2},
            {"source": "c4", "target": "c1", "label": "投資", "value": 2},
        ]
        
        return {
            "success": True,
            "data": {
                "nodes": mock_nodes,
                "links": mock_links,
                "metadata": {
                    "total_nodes": len(mock_nodes),
                    "total_links": len(mock_links),
                    "node_types": {
                        "Person": len(persons),
                        "Company": len(companies),
                        "Concept": len(concepts)
                    },
                    "source": "mock_data",
                    "note": "這是模擬數據，未來將集成 RAGFlow GraphRAG API 或 KuzuDB"
                }
            }
        }
        
    except Exception as e:
        logger.error(f"❌ 獲取圖譜數據失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取圖譜數據失敗: {str(e)}")


# 註冊 API 路由
app.include_router(dify_router, prefix="/api/dify", tags=["Dify"])
app.include_router(ragflow_router, prefix="/api/ragflow", tags=["RAGFlow"])
app.include_router(graph_router, prefix="/api/graph", tags=["Knowledge Graph"])
app.include_router(graph_import_router, prefix="/api/graph", tags=["Graph Import"])
app.include_router(system_router, prefix="/api/system", tags=["System"])


# 靜態文件服務
frontend_dir = Path(__file__).parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")


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
    return JSONResponse(
        status_code=500,
        content={
            "error": "內部伺服器錯誤",
            "detail": str(exc),
            "path": str(request.url)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app_anytype:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
