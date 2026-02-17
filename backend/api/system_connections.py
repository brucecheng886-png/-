"""
連線管理 API — system.py 拆分

包含：
- ConnectionModel / InlineTestRequest 模型
- CRUD 路由 (list / create / update / delete)
- 通用連線探測器 _probe_service
- 測試連線 (by ID / inline)
- 自動偵測服務 detect_services
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime

from backend.core.config import load_connections, save_connections, generate_connection_id

logger = logging.getLogger(__name__)
router = APIRouter()


# ------------------------------------------------------------------ #
#  Pydantic Models
# ------------------------------------------------------------------ #

class ConnectionModel(BaseModel):
    """連線配置模型"""
    name: str
    type: str  # dify | ragflow | ollama | openai | custom
    url: str
    api_key: str = ""
    note: str = ""
    remember_key: bool = True
    enabled: bool = True


class InlineTestRequest(BaseModel):
    """Dialog 內測試連線請求"""
    type: str
    url: str
    api_key: str = ""


# ------------------------------------------------------------------ #
#  通用探測器
# ------------------------------------------------------------------ #

async def _probe_service(service_type: str, url: str, api_key: str = "") -> dict:
    """測試單一服務連線（通用探測器）"""
    import httpx

    result = {"status": "unknown", "message": "", "info": {}}

    try:
        async with httpx.AsyncClient(timeout=5.0, verify=False) as client:
            if service_type == "ollama":
                resp = await client.get(f"{url.rstrip('/')}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = data.get("models", [])
                    names = [m["name"] for m in models[:10]]
                    result["status"] = "ok"
                    result["message"] = f"✅ 連線正常，{len(models)} 個模型: {', '.join(names)}"
                    result["info"] = {"models": names}
                else:
                    result["status"] = "error"
                    result["message"] = f"❌ HTTP {resp.status_code}"

            elif service_type == "dify":
                headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
                resp = await client.get(url, headers=headers)
                if resp.status_code in [200, 401, 404, 422]:
                    result["status"] = "ok"
                    result["message"] = "✅ Dify 服務運行中"
                    if not api_key:
                        result["message"] += "（API Key 未設定）"
                else:
                    result["status"] = "error"
                    result["message"] = f"❌ HTTP {resp.status_code}"

            elif service_type == "ragflow":
                headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
                resp = await client.get(f"{url.rstrip('/')}/datasets", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    ds = data.get("data", [])
                    count = len(ds) if isinstance(ds, list) else 0
                    result["status"] = "ok"
                    result["message"] = f"✅ RAGFlow 連線正常（{count} 個知識庫）"
                    result["info"] = {"dataset_count": count}
                elif resp.status_code == 401:
                    result["status"] = "warning"
                    result["message"] = "⚠️ API Key 無效或已過期"
                else:
                    result["status"] = "error"
                    result["message"] = f"❌ HTTP {resp.status_code}"

            elif service_type == "openai":
                headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
                resp = await client.get(f"{url.rstrip('/')}/models", headers=headers)
                if resp.status_code == 200:
                    result["status"] = "ok"
                    result["message"] = "✅ OpenAI API 連線正常"
                elif resp.status_code == 401:
                    result["status"] = "warning"
                    result["message"] = "⚠️ API Key 無效"
                else:
                    result["status"] = "error"
                    result["message"] = f"❌ HTTP {resp.status_code}"

            else:
                resp = await client.get(url)
                result["status"] = "ok" if resp.status_code < 500 else "error"
                result["message"] = f"HTTP {resp.status_code}"

    except Exception as e:
        err_type = type(e).__name__
        if 'ConnectError' in err_type or 'ConnectionError' in err_type:
            result["status"] = "error"
            result["message"] = f"❌ 無法連接到 {url}"
        elif 'Timeout' in err_type:
            result["status"] = "error"
            result["message"] = "❌ 連接超時"
        else:
            result["status"] = "error"
            result["message"] = f"❌ {err_type}: {str(e)[:100]}"

    return result


# ------------------------------------------------------------------ #
#  CRUD 路由
# ------------------------------------------------------------------ #

@router.get("/connections")
async def list_connections_api():
    """取得所有連線配置"""
    try:
        connections = load_connections()
        return {"success": True, "connections": connections}
    except Exception as e:
        logger.error(f"載入連線失敗: {e}")
        raise HTTPException(status_code=500, detail=f"載入連線失敗: {e}")


@router.post("/connections")
async def create_connection(conn: ConnectionModel):
    """新增連線"""
    try:
        now = datetime.now().isoformat()
        connections = load_connections()
        new_conn = {
            'id': generate_connection_id(),
            'name': conn.name,
            'type': conn.type,
            'url': conn.url,
            'api_key': conn.api_key if conn.remember_key else '',
            'note': conn.note,
            'remember_key': conn.remember_key,
            'enabled': conn.enabled,
            'created_at': now,
            'updated_at': now,
        }
        connections.append(new_conn)
        if not save_connections(connections):
            raise HTTPException(status_code=500, detail="儲存失敗")
        new_conn_resp = {**new_conn, 'api_key': conn.api_key}
        return {"success": True, "connection": new_conn_resp, "message": "連線已新增"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"新增連線失敗: {e}")
        raise HTTPException(status_code=500, detail=f"新增連線失敗: {e}")


@router.put("/connections/{conn_id}")
async def update_connection(conn_id: str, conn: ConnectionModel):
    """更新連線"""
    try:
        connections = load_connections()
        idx = next((i for i, c in enumerate(connections) if c['id'] == conn_id), None)
        if idx is None:
            raise HTTPException(status_code=404, detail="連線不存在")

        connections[idx].update({
            'name': conn.name,
            'type': conn.type,
            'url': conn.url,
            'api_key': conn.api_key if conn.remember_key else '',
            'note': conn.note,
            'remember_key': conn.remember_key,
            'enabled': conn.enabled,
            'updated_at': datetime.now().isoformat(),
        })
        if not save_connections(connections):
            raise HTTPException(status_code=500, detail="儲存失敗")
        resp_conn = {**connections[idx], 'api_key': conn.api_key}
        return {"success": True, "connection": resp_conn, "message": "連線已更新"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新連線失敗: {e}")
        raise HTTPException(status_code=500, detail=f"更新連線失敗: {e}")


@router.delete("/connections/{conn_id}")
async def delete_connection(conn_id: str):
    """刪除連線"""
    try:
        connections = load_connections()
        before = len(connections)
        connections = [c for c in connections if c['id'] != conn_id]
        if len(connections) == before:
            raise HTTPException(status_code=404, detail="連線不存在")
        if not save_connections(connections):
            raise HTTPException(status_code=500, detail="儲存失敗")
        return {"success": True, "message": "連線已刪除"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"刪除連線失敗: {e}")
        raise HTTPException(status_code=500, detail=f"刪除連線失敗: {e}")


# ------------------------------------------------------------------ #
#  連線測試
# ------------------------------------------------------------------ #

@router.post("/connections/{conn_id}/test")
async def test_connection_by_id(conn_id: str):
    """測試指定連線"""
    connections = load_connections()
    conn = next((c for c in connections if c['id'] == conn_id), None)
    if not conn:
        raise HTTPException(status_code=404, detail="連線不存在")
    result = await _probe_service(conn['type'], conn['url'], conn.get('api_key', ''))
    return {"success": True, "result": result}


@router.post("/test-connection-inline")
async def test_connection_inline(req: InlineTestRequest):
    """測試連線（不儲存，用於 Dialog 內即時測試）"""
    result = await _probe_service(req.type, req.url, req.api_key)
    return {"success": True, "result": result}


# ------------------------------------------------------------------ #
#  自動偵測服務
# ------------------------------------------------------------------ #

@router.post("/detect-services")
async def detect_services():
    """自動偵測可用的服務（掃描常見端口）"""
    import httpx

    probes = [
        {"type": "dify", "name": "Dify AI 服務", "url": "http://localhost:82/v1",
         "probe": "http://localhost:82", "note": "本地 Dify 服務 (Port 82)"},
        {"type": "dify", "name": "Dify (Port 5001)", "url": "http://localhost:5001/v1",
         "probe": "http://localhost:5001", "note": "Dify 備用端口 (Port 5001)"},
        {"type": "ragflow", "name": "RAGFlow 知識檢索", "url": "http://localhost:9380/api/v1",
         "probe": "http://localhost:9380", "note": "本地 RAGFlow (Port 9380)"},
        {"type": "ragflow", "name": "RAGFlow (Port 81)", "url": "http://localhost:81/api/v1",
         "probe": "http://localhost:81", "note": "RAGFlow Nginx 代理 (Port 81)"},
        {"type": "ollama", "name": "Ollama LLM 引擎", "url": "http://localhost:11434",
         "probe": "http://localhost:11434/api/tags", "note": "本地 Ollama (Port 11434)"},
    ]

    results = []
    existing_connections = load_connections()

    async with httpx.AsyncClient(timeout=3.0, verify=False) as client:
        for p in probes:
            entry = {
                "type": p["type"], "name": p["name"], "url": p["url"],
                "note": p["note"], "available": False, "info": "",
                "existing_key": "", "suggested": False,
            }
            try:
                resp = await client.get(p["probe"])
                entry["available"] = resp.status_code < 500
                if p["type"] == "ollama" and entry["available"]:
                    try:
                        data = resp.json()
                        models = data.get("models", [])
                        names = [m["name"] for m in models[:8]]
                        entry["info"] = f"{len(models)} 個模型: {', '.join(names)}"
                        entry["models"] = names
                    except Exception:
                        entry["info"] = "Ollama 服務運行中"
                elif entry["available"]:
                    entry["info"] = f"{p['name']} 運行中"
            except Exception:
                entry["info"] = "無法連接"

            for ec in existing_connections:
                if ec.get('type') == p['type']:
                    entry["existing_key"] = ec.get('api_key', '')
                    break

            results.append(entry)

    docker_suggestions = [
        {"type": "ollama", "name": "Ollama (Docker DNS)", "url": "http://ollama:11434",
         "note": "Docker 容器間通訊用", "available": None,
         "info": "用於 RAGFlow 等容器連接 Ollama", "existing_key": "", "suggested": True},
        {"type": "ollama", "name": "Ollama (Docker→Host)", "url": "http://host.docker.internal:11434",
         "note": "Docker 容器訪問主機用", "available": None,
         "info": "從 Docker 內連接主機上的 Ollama", "existing_key": "", "suggested": True},
    ]
    results.extend(docker_suggestions)

    return {"success": True, "services": results}
