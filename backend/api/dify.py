"""
Dify API 路由
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import httpx
import logging

from backend.core.config import settings
from backend.services.agent_service import agent_service

logger = logging.getLogger(__name__)
router = APIRouter()


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
async def chat_with_dify(request: DifyRequest):
    """與 Dify 對話"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{settings.DIFY_API_URL}/chat-messages",
                headers={
                    "Authorization": f"Bearer {settings.DIFY_API_KEY}",
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
    
    except httpx.ConnectError as e:
        logger.error(f"Dify 連線失敗: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"無法連接到 Dify API ({settings.DIFY_API_URL})。請確認 Docker 容器已啟動 (docker compose up -d)"
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
async def run_workflow(request: WorkflowRequest):
    """執行 Dify Workflow"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{settings.DIFY_API_URL}/workflows/run",
                headers={
                    "Authorization": f"Bearer {settings.DIFY_API_KEY}",
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
    except httpx.HTTPError as e:
        logger.error(f"Dify Workflow 錯誤: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow 執行失敗: {str(e)}")


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """獲取對話歷史"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{settings.DIFY_API_URL}/conversations/{conversation_id}",
                headers={"Authorization": f"Bearer {settings.DIFY_API_KEY}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"獲取對話失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取對話失敗: {str(e)}")


@router.get("/messages")
async def get_messages(conversation_id: str, limit: int = 20):
    """獲取消息列表"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{settings.DIFY_API_URL}/messages",
                headers={"Authorization": f"Bearer {settings.DIFY_API_KEY}"},
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
