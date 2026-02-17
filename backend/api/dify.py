"""
Dify API 路由 (包含 CircuitBreaker 斷路器保護)
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
import httpx
import logging
import os

from backend.core.config import settings, get_current_api_keys
from backend.core.circuit_breaker import dify_breaker, CircuitBreakerOpenError
from backend.services.agent_service import agent_service
from backend.core.auth import get_user_dify_key

logger = logging.getLogger(__name__)
router = APIRouter()


def get_dify_config(user_key: Optional[str] = None):
    """動態獲取 Dify 配置，優先使用用戶專屬 Key"""
    api_keys = get_current_api_keys()
    return {
        'api_key': user_key or api_keys['DIFY_API_KEY'],
        'api_url': api_keys['DIFY_API_URL']
    }


def _extract_user_key(request: Request) -> Optional[str]:
    """從 Request 中提取用戶專屬的 Dify API Key"""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        return get_user_dify_key(token)
    api_token = request.headers.get("x-api-token")
    if api_token:
        return get_user_dify_key(api_token)
    return None


class DifyRequest(BaseModel):
    """Dify 請求模型"""
    query: str
    user: str = "default_user"
    conversation_id: Optional[str] = None
    inputs: Dict[str, Any] = {}


class AgentRequest(BaseModel):
    """Agent 請求模型"""
    message: str
    dataset_id: Optional[str] = None
    user: str = "default_user"


class WorkflowRequest(BaseModel):
    """Workflow 請求模型"""
    inputs: Dict[str, Any]
    user: str = "default_user"


@router.post("/chat")
async def chat_with_dify(request: DifyRequest, raw_request: Request):
    """與 Dify 對話 (受 CircuitBreaker 保護，支援用戶專屬 Key)"""
    user_key = _extract_user_key(raw_request)
    config = get_dify_config(user_key)
    
    try:
        async with dify_breaker:
            client = raw_request.app.state.http_client
            response = await client.post(
                f"{config['api_url']}/chat-messages",
                headers={
                    "Authorization": f"Bearer {config['api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "query": request.query,
                    "user": request.user,
                    "conversation_id": request.conversation_id,
                    "inputs": request.inputs,
                    "response_mode": "blocking"
                }
            )
            response.raise_for_status()
            return response.json()
    
    except CircuitBreakerOpenError as e:
        logger.warning(f"🔴 Dify 斷路器已打開: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Dify 服務暫時不可用 (斷路器已打開，{e.remaining_seconds:.0f}秒後重試)"
        )
    
    except httpx.ConnectError as e:
        logger.error(f"Dify 連線失敗: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"無法連接到 Dify API ({config['api_url']})。請確認 Docker 容器已啟動 (docker compose up -d)"
        )
    
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            logger.error("Dify API Key 無效")
            raise HTTPException(
                status_code=401,
                detail="Dify API Key 無效，請檢查 .env 文件中的 DIFY_API_KEY 設定"
            )
        else:
            logger.error(f"Dify API HTTP 錯誤 {e.response.status_code}: {e}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Dify API 錯誤 ({e.response.status_code}): {e.response.text}"
            )
    
    except httpx.TimeoutException as e:
        logger.error(f"Dify API 請求超時: {e}")
        raise HTTPException(
            status_code=504,
            detail="Dify API 請求超時，請稍後再試"
        )
    
    except Exception as e:
        logger.error(f"Dify API 未知錯誤: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Dify API 請求失敗: {str(e)}"
        )


@router.post("/workflow/run")
async def run_workflow(request: WorkflowRequest, raw_request: Request):
    """執行 Dify Workflow (受 CircuitBreaker 保護)"""
    config = get_dify_config()
    
    try:
        async with dify_breaker:
            client = raw_request.app.state.http_client
            response = await client.post(
                f"{config['api_url']}/workflows/run",
                headers={
                    "Authorization": f"Bearer {config['api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "inputs": request.inputs,
                    "user": request.user,
                    "response_mode": "blocking"
                }
            )
            response.raise_for_status()
            return response.json()
    except CircuitBreakerOpenError as e:
        raise HTTPException(status_code=503, detail=f"Dify 服務暫時不可用: {e}")
    except httpx.HTTPError as e:
        logger.error(f"Dify Workflow 錯誤: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow 執行失敗: {str(e)}")


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, raw_request: Request):
    """獲取對話歷史"""
    config = get_dify_config()
    
    try:
        client = raw_request.app.state.http_client
        response = await client.get(
            f"{config['api_url']}/conversations/{conversation_id}",
            headers={"Authorization": f"Bearer {config['api_key']}"}
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        logger.error(f"獲取對話失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取對話失敗: {str(e)}")


@router.get("/messages")
async def get_messages(conversation_id: str, limit: int = 20, raw_request: Request = None):
    """獲取消息列表"""
    config = get_dify_config()
    
    try:
        client = raw_request.app.state.http_client
        response = await client.get(
            f"{config['api_url']}/messages",
            headers={"Authorization": f"Bearer {config['api_key']}"},
            params={"conversation_id": conversation_id, "limit": limit}
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        logger.error(f"獲取消息失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取消息失敗: {str(e)}")


@router.post("/agent/chat")
async def agent_chat(request: AgentRequest):
    """
    Agent 聊天端點 - 智能路由
    
    功能：
    1. 自動識別用戶意圖（RAG/自動化/閒聊）
    2. 路由到對應處理模式
    3. 返回統一格式結果
    
    Returns:
        {
            "success": bool,
            "answer": str,
            "detected_intent": str,  # "rag" | "automation" | "chat"
            "source_documents": [],  # RAG 模式時包含引用
            "action_result": {},     # 自動化模式時包含執行結果
            "mode": str
        }
    """
    try:
        logger.info(f"📨 Agent 收到消息: {request.message[:50]}...")
        
        # 調用 Agent 服務處理
        result = await agent_service.process_message(
            user_message=request.message,
            dataset_id=request.dataset_id
        )
        
        return result
    
    except Exception as e:
        logger.error(f"❌ Agent 處理失敗: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Agent 處理失敗: {str(e)}"
        )
