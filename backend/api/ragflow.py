"""
RAGFlow API 路由 (包含 CircuitBreaker 斷路器保護)
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import logging
import os

from backend.core.config import settings, get_current_api_keys
from backend.core.circuit_breaker import ragflow_breaker, CircuitBreakerOpenError

logger = logging.getLogger(__name__)
router = APIRouter()


def get_ragflow_config():
    """動態獲取 RAGFlow 配置"""
    api_keys = get_current_api_keys()
    return {
        'api_key': api_keys['RAGFLOW_API_KEY'],
        'api_url': api_keys['RAGFLOW_API_URL']
    }


class RAGFlowQuery(BaseModel):
    """RAGFlow 查詢模型"""
    question: str
    dataset_ids: List[str] = []
    top_k: int = 5


class DocumentUpload(BaseModel):
    """文檔上傳模型"""
    dataset_id: str
    name: str


@router.post("/query")
async def query_ragflow(request: RAGFlowQuery):
    """查詢 RAGFlow (受 CircuitBreaker 保護)"""
    try:
        config = get_ragflow_config()
        
        async with ragflow_breaker:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                response = await client.post(
                    f"{config['api_url']}/retrieval",
                    headers={
                        "Authorization": f"Bearer {config['api_key']}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "question": request.question,
                        "dataset_ids": request.dataset_ids,
                        "top_k": request.top_k
                    }
                )
                response.raise_for_status()
                return response.json()
    except CircuitBreakerOpenError as e:
        logger.warning(f"🔴 RAGFlow 斷路器已打開: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"RAGFlow 服務暫時不可用 (斷路器已打開，{e.remaining_seconds:.0f}秒後重試)"
        )
    except httpx.HTTPError as e:
        logger.error(f"RAGFlow API 錯誤: {e}")
        raise HTTPException(status_code=500, detail=f"RAGFlow 查詢失敗: {str(e)}")


@router.get("/datasets")
async def list_datasets():
    """獲取數據集列表 (受 CircuitBreaker 保護)"""
    try:
        config = get_ragflow_config()
        
        async with ragflow_breaker:
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                response = await client.get(
                    f"{config['api_url']}/datasets",
                    headers={"Authorization": f"Bearer {config['api_key']}"}
                )
                response.raise_for_status()
                return response.json()
    except CircuitBreakerOpenError as e:
        raise HTTPException(status_code=503, detail=f"RAGFlow 服務暫時不可用: {e}")
    except httpx.HTTPError as e:
        logger.error(f"獲取數據集失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取數據集失敗: {str(e)}")


@router.post("/datasets")
async def create_dataset(name: str, description: str = ""):
    """創建數據集"""
    try:
        config = get_ragflow_config()
        
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{config['api_url']}/datasets",
                headers={
                    "Authorization": f"Bearer {config['api_key']}",
                    "Content-Type": "application/json"
                },
                json={"name": name, "description": description}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"創建數據集失敗: {e}")
        raise HTTPException(status_code=500, detail=f"創建數據集失敗: {str(e)}")


@router.post("/documents/upload")
async def upload_document(
    dataset_id: str,
    file: UploadFile = File(...)
):
    """上傳文檔"""
    try:
        config = get_ragflow_config()
        content = await file.read()
        
        async with httpx.AsyncClient(timeout=60) as client:
            files = {"file": (file.filename, content, file.content_type)}
            data = {"dataset_id": dataset_id}
            
            response = await client.post(
                f"{config['api_url']}/documents",
                headers={"Authorization": f"Bearer {config['api_key']}"},
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"上傳文檔失敗: {e}")
        raise HTTPException(status_code=500, detail=f"上傳文檔失敗: {str(e)}")


@router.get("/documents/{dataset_id}")
async def list_documents(dataset_id: str):
    """列出數據集中的文檔"""
    config = get_ragflow_config()
    
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{config['api_url']}/datasets/{dataset_id}/documents",
                headers={"Authorization": f"Bearer {config['api_key']}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"獲取文檔列表失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取文檔列表失敗: {str(e)}")
