"""
系統配置管理 API
用於動態更新配置（優先使用 config.json，兼容 .env）
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import os
import re
import logging
import shutil
from pathlib import Path
from datetime import datetime
from backend.core.config import load_config_from_file, save_config_to_file, get_current_api_keys, settings
from backend.core.circuit_breaker import dify_breaker, ragflow_breaker

logger = logging.getLogger(__name__)
router = APIRouter()


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


def is_masked_key(key: Optional[str]) -> bool:
    """檢測是否為遮罩後的 API Key（包含連續 * 號）"""
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
    獲取當前系統配置
    
    返回格式:
    {
        "success": true,
        "config": {
            "dify_key": "app-xxxxxxxx",
            "ragflow_key": "ragflow-xxxxxxxx",
            "dify_api_url": "http://localhost:82/v1",
            "ragflow_api_url": "http://localhost:9380/api/v1"
        }
    }
    """
    try:
        # 從統一的配置源獲取（config.json 優先，然後是環境變數）
        api_keys = get_current_api_keys()
        
        return ConfigResponse(
            success=True,
            message="配置獲取成功",
            config={
                "dify_key": mask_api_key(api_keys['DIFY_API_KEY']),
                "ragflow_key": mask_api_key(api_keys['RAGFLOW_API_KEY']),
                "dify_api_url": api_keys['DIFY_API_URL'],
                "ragflow_api_url": api_keys['RAGFLOW_API_URL'],
                "config_source": "config.json (C:/BruV_Data/config.json)"
            }
        )
    
    except Exception as e:
        logger.error(f"獲取配置失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取配置失敗: {str(e)}")


@router.post("/config")
async def update_config(request: ConfigUpdateRequest):
    """
    更新系統配置（保存到 config.json）
    
    請求格式:
    {
        "dify_key": "app-xxxxxxxxxxxxxxxx",
        "ragflow_key": "ragflow-xxxxxxxxxxxxxxxx",
        "dify_api_url": "http://localhost:82/v1",
        "ragflow_api_url": "http://localhost:9380/api/v1"
    }
    
    返回格式:
    {
        "success": true,
        "message": "配置更新成功",
        "config": { ... }
    }
    """
    try:
        config_updates = {}
        
        # 準備要更新的配置（跳過遮罩值，防止前端將 masked key 存回）
        if request.dify_key:
            if is_masked_key(request.dify_key):
                logger.warning("忽略遮罩的 dify_api_key，不更新")
            else:
                config_updates['dify_api_key'] = request.dify_key
                logger.info("準備更新 dify_api_key")
        
        if request.ragflow_key:
            if is_masked_key(request.ragflow_key):
                logger.warning("忽略遮罩的 ragflow_api_key，不更新")
            else:
                config_updates['ragflow_api_key'] = request.ragflow_key
                logger.info("準備更新 ragflow_api_key")
        
        if request.dify_api_url:
            config_updates['dify_api_url'] = request.dify_api_url
            logger.info(f"準備更新 dify_api_url: {request.dify_api_url}")
        
        if request.ragflow_api_url:
            config_updates['ragflow_api_url'] = request.ragflow_api_url
            logger.info(f"準備更新 ragflow_api_url: {request.ragflow_api_url}")
        
        if not config_updates:
            raise HTTPException(
                status_code=400, 
                detail="至少需要提供一個設定項目"
            )
        
        # 保存到 config.json
        success = save_config_to_file(config_updates)
        
        if not success:
            raise HTTPException(status_code=500, detail="更新配置檔案失敗")
        
        # 準備回應配置（返回完整 API Key，不遮罩）
        response_config = {}
        if request.dify_key:
            response_config['dify_key'] = request.dify_key
        if request.ragflow_key:
            response_config['ragflow_key'] = request.ragflow_key
        if request.dify_api_url:
            response_config['dify_api_url'] = request.dify_api_url
        if request.ragflow_api_url:
            response_config['ragflow_api_url'] = request.ragflow_api_url
        
        return ConfigResponse(
            success=True,
            message="✅ 配置已保存到 config.json！修改將立即生效",
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


@router.post("/test-connection")
async def test_connection():
    """
    測試 Dify 和 RAGFlow 服務連接
    
    返回格式:
    {
        "success": true,
        "dify": {
            "status": "ok" | "error",
            "url": "http://localhost:5001/v1",
            "message": "連接成功" | "錯誤訊息",
            "api_key_configured": true
        },
        "ragflow": {
            "status": "ok" | "error",
            "url": "http://localhost:9380/api/v1",
            "message": "連接成功" | "錯誤訊息",
            "api_key_configured": true
        }
    }
    """
    from backend.core.config import get_current_api_keys
    import httpx
    
    api_keys = get_current_api_keys()
    results = {
        "success": True,
        "dify": {
            "status": "unknown",
            "url": api_keys['DIFY_API_URL'],
            "message": "",
            "api_key_configured": bool(api_keys['DIFY_API_KEY'])
        },
        "ragflow": {
            "status": "unknown",
            "url": api_keys['RAGFLOW_API_URL'],
            "message": "",
            "api_key_configured": bool(api_keys['RAGFLOW_API_KEY'])
        }
    }
    
    # 測試 Dify 連接
    try:
        if not api_keys['DIFY_API_KEY']:
            results['dify']['status'] = 'warning'
            results['dify']['message'] = '❌ API Key 未配置'
        else:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # 簡單測試 Dify API 是否可訪問
                response = await client.get(
                    api_keys['DIFY_API_URL'],
                    headers={"Authorization": f"Bearer {api_keys['DIFY_API_KEY']}"}
                )
                # 任何有效的 HTTP 響應都表示服務在運行
                # 401/404 都是正常的（服務運行但端點/權限問題）
                if response.status_code in [200, 401, 404, 422]:
                    results['dify']['status'] = 'ok'
                    results['dify']['message'] = '✅ 連接成功'
                elif response.status_code == 403:
                    results['dify']['status'] = 'error'
                    results['dify']['message'] = '❌ API Key 無權限'
                else:
                    results['dify']['status'] = 'error'
                    results['dify']['message'] = f'❌ 服務錯誤 ({response.status_code})'
    except httpx.ConnectError:
        results['dify']['status'] = 'error'
        results['dify']['message'] = f'❌ 無法連接到 {api_keys["DIFY_API_URL"]} - 請確認服務已啟動'
    except httpx.TimeoutException:
        results['dify']['status'] = 'error'
        results['dify']['message'] = '❌ 連接超時'
    except Exception as e:
        results['dify']['status'] = 'error'
        results['dify']['message'] = f'❌ {str(e)}'
    
    # 測試 RAGFlow 連接
    try:
        if not api_keys['RAGFLOW_API_KEY']:
            results['ragflow']['status'] = 'warning'
            results['ragflow']['message'] = '❌ API Key 未配置'
        else:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # 測試 RAGFlow datasets 端點
                response = await client.get(
                    f"{api_keys['RAGFLOW_API_URL'].rstrip('/')}/datasets",
                    headers={"Authorization": f"Bearer {api_keys['RAGFLOW_API_KEY']}"}
                )
                if response.status_code == 200:
                    results['ragflow']['status'] = 'ok'
                    data = response.json()
                    # 安全地獲取數據集數量
                    datasets = data.get('data', [])
                    if isinstance(datasets, list):
                        dataset_count = len(datasets)
                        results['ragflow']['message'] = f'✅ 連接成功（找到 {dataset_count} 個知識庫）'
                    else:
                        results['ragflow']['message'] = '✅ 連接成功'
                elif response.status_code == 401:
                    results['ragflow']['status'] = 'error'
                    results['ragflow']['message'] = '❌ API Key 無效或已過期'
                else:
                    results['ragflow']['status'] = 'error'
                    results['ragflow']['message'] = f'❌ 服務錯誤 ({response.status_code})'
    except httpx.ConnectError:
        results['ragflow']['status'] = 'error'
        results['ragflow']['message'] = f'❌ 無法連接到 {api_keys["RAGFLOW_API_URL"]} - 請確認服務已啟動'
    except httpx.TimeoutException:
        results['ragflow']['status'] = 'error'
        results['ragflow']['message'] = '❌ 連接超時'
    except Exception as e:
        results['ragflow']['status'] = 'error'
        results['ragflow']['message'] = f'❌ {str(e)}'
    
    # 判斷整體狀態
    if results['dify']['status'] == 'error' or results['ragflow']['status'] == 'error':
        results['success'] = False
    
    return results


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    graph_id: str = Form(None),
    graph_mode: str = Form("existing"),
    graph_name: str = Form(None),
    enable_ai_link: str = Form("false"),
    ragflow_dataset_id: str = Form(None)
):
    """
    上傳檔案到監控資料夾，自動觸發 WatcherService 處理
    
    Args:
        file: 上傳的檔案
        graph_id: 目標圖譜 ID
        graph_mode: 圖譜模式 ("new" 或 "existing")
        graph_name: 新圖譜名稱 (當 graph_mode="new" 時使用)
        enable_ai_link: 是否啟用 AI 智能連線 ("true" 或 "false")
        ragflow_dataset_id: RAGFlow 知識庫 ID (當 enable_ai_link="true" 時使用)
    
    Returns:
        上傳結果資訊
    """
    try:
        ai_enabled = enable_ai_link.lower() == "true"
        ragflow_doc_ids = []
        logger.info(f"收到文件上傳請求: {file.filename}, graph_mode={graph_mode}, graph_id={graph_id}")
        
        # 檔案大小限制檢查
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            max_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"檔案大小超過限制（最大 {max_mb} MB）"
            )
        
        # 使用監控資料夾作為上傳目錄（跨平台路徑）
        upload_dir = Path(settings.AUTO_IMPORT_DIR)
        
        # 確保上傳目錄存在
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # 檢查檔案名稱
        if not file.filename:
            raise HTTPException(status_code=400, detail="檔案名稱不能為空")
        
        # 清洗檔案名稱，防止路徑遍歷攻擊
        import re
        safe_filename = re.sub(r'[\\/:*?"<>|]', '_', Path(file.filename).name)
        if safe_filename.startswith('.'):
            safe_filename = '_' + safe_filename
        
        # 生成檔案路徑
        file_path = upload_dir / safe_filename
        
        # 如果檔案已存在，添加時間戳
        if file_path.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_stem = file_path.stem
            file_suffix = file_path.suffix
            file_path = upload_dir / f"{file_stem}_{timestamp}{file_suffix}"
        
        # ── 階段 1: 先寫 meta.json（確保 Watcher 讀取不會失敗）──
        # 注意：主檔案尚未寫入，Watcher 不會被觸發
        import json
        metadata_file = file_path.with_suffix(file_path.suffix + '.meta.json')
        metadata = {
            "graph_id": graph_id,
            "graph_mode": graph_mode,
            "graph_name": graph_name,
            "upload_time": datetime.now().isoformat(),
            "ai_enabled": ai_enabled,
            "ragflow_dataset_id": ragflow_dataset_id if ai_enabled else None,
            "ragflow_result": None,
            "ragflow_doc_ids": None
        }
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        logger.info(f"📋 圖譜元數據已預寫入: graph_id={graph_id}, path={metadata_file.name}")
        
        # ── 階段 2: RAGFlow 上傳（耗時操作，在主檔案寫入前完成）──
        # 先用臨時檔寫入 content 供 RAGFlow 上傳，但不放在 Auto_Import 觸發 Watcher
        ragflow_result = None
        temp_file_for_ragflow = None
        if ai_enabled and ragflow_dataset_id:
            try:
                logger.info(f"🤖 正在上傳到 RAGFlow 知識庫: {ragflow_dataset_id}")
                from backend.rag_client import RAGFlowClient
                from backend.core.config import get_current_api_keys
                
                # 動態獲取當前 API Keys
                api_keys = get_current_api_keys()
                
                # 檢查 API Key 是否配置
                if not api_keys['RAGFLOW_API_KEY']:
                    logger.warning("⚠️ RAGFlow API Key 未配置，跳過 RAGFlow 上傳")
                else:
                    # 將內容寫入臨時檔案供 RAGFlow 上傳（避免觸發 Watcher）
                    import tempfile
                    temp_dir = tempfile.gettempdir()
                    temp_file_for_ragflow = Path(temp_dir) / file_path.name
                    with open(temp_file_for_ragflow, "wb") as tmp:
                        tmp.write(content)
                    
                    # 使用配置中的 RAGFlow API URL
                    ragflow_api_url = api_keys['RAGFLOW_API_URL']
                    rag_client = RAGFlowClient(
                        api_key=api_keys['RAGFLOW_API_KEY'],
                        base_url=ragflow_api_url
                    )
                    
                    # 非同步上傳到 RAGFlow（避免阻塞事件迴圈）
                    ragflow_result = await rag_client.async_upload_file(
                        dataset_id=ragflow_dataset_id,
                        file_path=str(temp_file_for_ragflow)
                    )
                    logger.info(f"✅ RAGFlow 上傳成功: {ragflow_result}")
                    
                    # 自動觸發文檔解析（chunking + embedding）
                    uploaded_docs = ragflow_result.get("data", [])
                    if uploaded_docs:
                        doc_ids = [d["id"] for d in uploaded_docs if "id" in d]
                        if doc_ids:
                            import httpx
                            async with httpx.AsyncClient(timeout=300) as parse_client:
                                parse_resp = await parse_client.post(
                                    f"{ragflow_api_url}/datasets/{ragflow_dataset_id}/chunks",
                                    headers={
                                        "Authorization": f"Bearer {api_keys['RAGFLOW_API_KEY']}",
                                        "Content-Type": "application/json"
                                    },
                                    json={"document_ids": doc_ids}
                                )
                                parse_resp.raise_for_status()
                                logger.info(f"✅ 已觸發 RAGFlow 文檔解析: {doc_ids}")
                                ragflow_doc_ids = doc_ids
            except Exception as e:
                logger.warning(f"⚠️ RAGFlow 上傳失敗（繼續處理）: {e}")
            finally:
                # 清理臨時檔案
                if temp_file_for_ragflow and temp_file_for_ragflow.exists():
                    try:
                        temp_file_for_ragflow.unlink()
                    except OSError:
                        pass
        
        # ── 階段 3: 回填 meta.json（補充 RAGFlow 結果）──
        metadata["ragflow_result"] = ragflow_result
        metadata["ragflow_doc_ids"] = ragflow_doc_ids if ai_enabled else None
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        # ── 階段 3.5: 將 ragflow_dataset_id 回寫到圖譜元數據 ──
        if ai_enabled and ragflow_dataset_id and graph_id:
            try:
                from backend.api.graph import get_kuzu_manager
                kuzu_mgr = get_kuzu_manager()
                if kuzu_mgr:
                    existing_meta = kuzu_mgr.get_graph_metadata(graph_id)
                    if existing_meta and not existing_meta.get('ragflow_dataset_id'):
                        kuzu_mgr.update_graph_metadata(graph_id, ragflow_dataset_id=ragflow_dataset_id)
                        logger.info(f"📌 已將 ragflow_dataset_id={ragflow_dataset_id} 寫入圖譜 {graph_id}")
            except Exception as e:
                logger.warning(f"⚠️ 回寫 ragflow_dataset_id 失敗（不影響上傳）: {e}")
        
        # ── 階段 4: 最後寫入主檔案（觸發 Watcher，此時 meta.json 已就緒）──
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"✅ 檔案上傳成功，已進入監控佇列: {file_path}")
        logger.info(f"📋 圖譜元數據已保存: {metadata}")
        
        message = "檔案已送入神經網路，正在解析中..."
        if ai_enabled:
            if ragflow_result:
                message = "✨ 檔案已上傳到 RAGFlow 並送入神經網路，正在 AI 分析中..."
            else:
                message = "⚠️ 檔案已送入神經網路（RAGFlow 上傳失敗），正在解析中..."
        
        return {
            "success": True,
            "message": message,
            "filename": file.filename,
            "saved_path": str(file_path),
            "size": os.path.getsize(file_path),
            "upload_time": datetime.now().isoformat(),
            "ai_enabled": ai_enabled,
            "ragflow_processed": ragflow_result is not None,
            "ragflow_dataset_id": ragflow_dataset_id if ai_enabled else None,
            "ragflow_doc_ids": ragflow_doc_ids if ai_enabled else []
        }
        
    except Exception as e:
        logger.error(f"❌ 檔案上傳失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"檔案上傳失敗: {str(e)}")


# ==================== 斷路器狀態 API ====================

@router.get("/circuit-breakers")
async def get_circuit_breaker_status():
    """
    取得所有斷路器狀態

    Returns:
        各下游服務斷路器的當前狀態、失敗次數、剩餘恢復時間
    """
    return {
        "success": True,
        "data": {
            "dify": dify_breaker.get_status(),
            "ragflow": ragflow_breaker.get_status(),
        }
    }


# ==================== DLQ (Dead Letter Queue) API ====================

@router.get("/saga-dlq")
async def get_saga_dlq():
    """
    取得 Saga 死信佇列中的未解決項目

    用途：管理員排查 RAGFlow ↔ KuzuDB 不一致問題
    """
    try:
        from backend.services.watcher import dlq
        items = dlq.list_unresolved(limit=50)
        return {
            "success": True,
            "data": items,
            "total": len(items)
        }
    except Exception as e:
        logger.error(f"DLQ 查詢失敗: {e}")
        raise HTTPException(status_code=500, detail=f"DLQ 查詢失敗: {str(e)}")


@router.post("/saga-dlq/{dlq_id}/resolve")
async def resolve_dlq_item(dlq_id: str):
    """標記 DLQ 項目為已解決"""
    try:
        from backend.services.watcher import dlq
        success = dlq.mark_resolved(dlq_id)
        if success:
            return {"success": True, "message": f"DLQ 項目 {dlq_id} 已標記為已解決"}
        raise HTTPException(status_code=404, detail="DLQ 項目不存在")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DLQ 標記失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 系統維護 API ====================

@router.post("/maintenance/cleanup")
async def system_cleanup(retention_days: int = 7):
    """
    清理過期的 SagaLog 與 TaskQueue 記錄

    - SagaLog: 刪除狀態為 completed / compensation_complete 且超過 retention_days 的記錄
    - TaskQueue: 刪除狀態為 completed / failed 且超過 retention_days 的記錄
    - DLQ: 保留不動，需人工確認後手動解決

    Args:
        retention_days: 保留天數，預設 7 天
    """
    import sqlite3
    from datetime import datetime, timedelta

    cutoff = (datetime.now() - timedelta(days=retention_days)).isoformat()
    results = {"saga_deleted": 0, "task_deleted": 0, "retention_days": retention_days, "cutoff": cutoff}

    # ── 清理 SagaLog ──
    try:
        from backend.services.saga import _SAGA_DB_PATH
        if _SAGA_DB_PATH.exists():
            conn = sqlite3.connect(str(_SAGA_DB_PATH), timeout=5)
            cursor = conn.execute(
                "DELETE FROM saga_logs WHERE status IN ('completed', 'compensation_complete') "
                "AND created_at < ?",
                (cutoff,)
            )
            results["saga_deleted"] = cursor.rowcount
            conn.commit()
            conn.close()
            logger.info(f"🧹 已清理 {results['saga_deleted']} 筆過期 SagaLog")
    except Exception as e:
        logger.error(f"SagaLog 清理失敗: {e}")
        results["saga_error"] = str(e)

    # ── 清理 TaskQueue ──
    try:
        from backend.services.task_queue import _TASK_DB_PATH
        if _TASK_DB_PATH.exists():
            conn = sqlite3.connect(str(_TASK_DB_PATH), timeout=5)
            cursor = conn.execute(
                "DELETE FROM tasks WHERE status IN ('completed', 'failed') "
                "AND completed_at < ?",
                (cutoff,)
            )
            results["task_deleted"] = cursor.rowcount
            conn.commit()
            conn.close()
            logger.info(f"🧹 已清理 {results['task_deleted']} 筆過期 TaskQueue 記錄")
    except Exception as e:
        logger.error(f"TaskQueue 清理失敗: {e}")
        results["task_error"] = str(e)

    return {
        "success": True,
        "message": f"清理完成: SagaLog {results['saga_deleted']} 筆, TaskQueue {results['task_deleted']} 筆 (DLQ 保留不動)",
        "data": results
    }
