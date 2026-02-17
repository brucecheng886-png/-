"""
系統 API — 薄路由層

核心邏輯已拆分至:
  - system_config.py      (配置工具 & Pydantic 模型)
  - system_upload.py       (檔案上傳管線)
  - system_connections.py  (連線管理 CRUD + 偵測)
"""
from fastapi import APIRouter, HTTPException
import os
import logging

from backend.core.config import (
    load_config_from_file, save_config_to_file, get_current_api_keys, settings
)
from backend.core.circuit_breaker import dify_breaker, ragflow_breaker

# ---- 從拆分模組匯入 ----
from .system_config import (
    ConfigUpdateRequest,
    ConfigResponse,
    get_env_file_path,
    mask_api_key,
    is_masked_key,
    read_env_file,
    update_env_file,
    reload_env_to_os,
)
from . import system_upload
from . import system_connections

logger = logging.getLogger(__name__)
router = APIRouter()

# ---- 包含子模組路由 ----
router.include_router(system_upload.router)
router.include_router(system_connections.router)


# ===== 配置 API =====

@router.get("/config")
async def get_config():
    """獲取當前系統配置"""
    try:
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
    """更新系統配置（保存到 config.json）"""
    try:
        config_updates = {}

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
            raise HTTPException(status_code=400, detail="至少需要提供一個設定項目")

        success = save_config_to_file(config_updates)
        if not success:
            raise HTTPException(status_code=500, detail="更新配置檔案失敗")

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
    """獲取 .env 檔案位置和狀態"""
    try:
        env_path = get_env_file_path()
        exists = env_path.exists()
        writable = os.access(env_path.parent, os.W_OK)
        return {"success": True, "path": str(env_path), "exists": exists, "writable": writable}
    except Exception as e:
        logger.error(f"獲取 .env 檔案資訊失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取檔案資訊失敗: {str(e)}")


# ===== 舊版連線測試 (向下相容) =====

@router.post("/test-connection")
async def test_connection():
    """測試 Dify 和 RAGFlow 服務連接（舊版）"""
    import httpx

    api_keys = get_current_api_keys()
    results = {
        "success": True,
        "dify": {
            "status": "unknown", "url": api_keys['DIFY_API_URL'],
            "message": "", "api_key_configured": bool(api_keys['DIFY_API_KEY'])
        },
        "ragflow": {
            "status": "unknown", "url": api_keys['RAGFLOW_API_URL'],
            "message": "", "api_key_configured": bool(api_keys['RAGFLOW_API_KEY'])
        }
    }

    # 測試 Dify
    try:
        if not api_keys['DIFY_API_KEY']:
            results['dify']['status'] = 'warning'
            results['dify']['message'] = '❌ API Key 未配置'
        else:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    api_keys['DIFY_API_URL'],
                    headers={"Authorization": f"Bearer {api_keys['DIFY_API_KEY']}"}
                )
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

    # 測試 RAGFlow
    try:
        if not api_keys['RAGFLOW_API_KEY']:
            results['ragflow']['status'] = 'warning'
            results['ragflow']['message'] = '❌ API Key 未配置'
        else:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{api_keys['RAGFLOW_API_URL'].rstrip('/')}/datasets",
                    headers={"Authorization": f"Bearer {api_keys['RAGFLOW_API_KEY']}"}
                )
                if response.status_code == 200:
                    results['ragflow']['status'] = 'ok'
                    data = response.json()
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

    if results['dify']['status'] == 'error' or results['ragflow']['status'] == 'error':
        results['success'] = False

    return results


# ===== 斷路器 / DLQ / 系統維護 =====

@router.get("/circuit-breakers")
async def get_circuit_breaker_status():
    """取得所有斷路器狀態"""
    return {
        "success": True,
        "data": {
            "dify": dify_breaker.get_status(),
            "ragflow": ragflow_breaker.get_status(),
        }
    }


@router.get("/saga-dlq")
async def get_saga_dlq():
    """取得 Saga 死信佇列中的未解決項目"""
    try:
        from backend.services.watcher import dlq
        items = dlq.list_unresolved(limit=50)
        return {"success": True, "data": items, "total": len(items)}
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


@router.post("/maintenance/cleanup")
async def system_cleanup(retention_days: int = 7):
    """清理過期的 SagaLog 與 TaskQueue 記錄"""
    import sqlite3
    from datetime import datetime, timedelta

    cutoff = (datetime.now() - timedelta(days=retention_days)).isoformat()
    results = {"saga_deleted": 0, "task_deleted": 0, "retention_days": retention_days, "cutoff": cutoff}

    try:
        from backend.services.saga import _SAGA_DB_PATH
        if _SAGA_DB_PATH.exists():
            conn = sqlite3.connect(str(_SAGA_DB_PATH), timeout=5)
            cursor = conn.execute(
                "DELETE FROM saga_logs WHERE status IN ('completed', 'compensation_complete') "
                "AND created_at < ?", (cutoff,)
            )
            results["saga_deleted"] = cursor.rowcount
            conn.commit()
            conn.close()
            logger.info(f"🧹 已清理 {results['saga_deleted']} 筆過期 SagaLog")
    except Exception as e:
        logger.error(f"SagaLog 清理失敗: {e}")
        results["saga_error"] = str(e)

    try:
        from backend.services.task_queue import _TASK_DB_PATH
        if _TASK_DB_PATH.exists():
            conn = sqlite3.connect(str(_TASK_DB_PATH), timeout=5)
            cursor = conn.execute(
                "DELETE FROM tasks WHERE status IN ('completed', 'failed') "
                "AND completed_at < ?", (cutoff,)
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
