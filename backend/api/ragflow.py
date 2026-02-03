"""
RAGFlow API 路由
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import logging

from backend.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


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
    """查詢 RAGFlow"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{settings.RAGFLOW_API_URL}/retrieval",
                headers={
                    "Authorization": f"Bearer {settings.RAGFLOW_API_KEY}",
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
    except httpx.HTTPError as e:
        logger.error(f"RAGFlow API 錯誤: {e}")
        raise HTTPException(status_code=500, detail=f"RAGFlow 查詢失敗: {str(e)}")


@router.get("/datasets")
async def list_datasets():
    """獲取數據集列表"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{settings.RAGFLOW_API_URL}/datasets",
                headers={"Authorization": f"Bearer {settings.RAGFLOW_API_KEY}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"獲取數據集失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取數據集失敗: {str(e)}")


@router.post("/datasets")
async def create_dataset(name: str, description: str = ""):
    """創建數據集"""
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{settings.RAGFLOW_API_URL}/datasets",
                headers={
                    "Authorization": f"Bearer {settings.RAGFLOW_API_KEY}",
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
    """上傳文檔到 RAGFlow"""
    try:
        content = await file.read()
        
        async with httpx.AsyncClient(timeout=60) as client:
            files = {"file": (file.filename, content, file.content_type)}
            data = {"dataset_id": dataset_id}
            
            response = await client.post(
                f"{settings.RAGFLOW_API_URL}/documents",
                headers={"Authorization": f"Bearer {settings.RAGFLOW_API_KEY}"},
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
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{settings.RAGFLOW_API_URL}/datasets/{dataset_id}/documents",
                headers={"Authorization": f"Bearer {settings.RAGFLOW_API_KEY}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"獲取文檔列表失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取文檔列表失敗: {str(e)}")
