"""
RAGFlow API 客戶端
用於與本地 RAGFlow Server 進行文件上傳與管理
使用 httpx.AsyncClient 以避免阻塞 FastAPI 的 async 事件迴圈
"""
import httpx
from pathlib import Path
from typing import Optional, Dict, Any


class RAGFlowAPIError(Exception):
    """RAGFlow API 業務層級錯誤（HTTP 200 但 code ≠ 0）"""
    def __init__(self, code: int, message: str):
        self.code = code
        super().__init__(f"RAGFlow API error [{code}]: {message}")


class RAGFlowClient:
    """RAGFlow Server API 客戶端（非同步）"""

    def __init__(self, api_key: str, base_url: str = "http://localhost:9380/api/v1"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self._headers = {'Authorization': f'Bearer {api_key}'}

    @staticmethod
    def _check_response(result: dict) -> dict:
        """檢查 RAGFlow 回應 body 的 code 欄位，非 0 表示業務錯誤"""
        code = result.get('code', -1)
        if code != 0:
            msg = result.get('message', 'unknown error')
            raise RAGFlowAPIError(code, msg)
        return result

    # ---------- 非同步方法（推薦在 FastAPI 路由中使用） ----------

    async def async_upload_file(
        self,
        dataset_id: str,
        file_path: str,
        chunk_method: str = "naive",
        parser_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """非同步上傳文件到指定的知識庫"""
        fp = Path(file_path)
        if not fp.exists():
            raise FileNotFoundError(f"檔案不存在: {fp}")

        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        content = fp.read_bytes()
        files = {'file': (fp.name, content, self._get_mime_type(fp))}

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, headers=self._headers, files=files)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_list_documents(self, dataset_id: str) -> Dict[str, Any]:
        """非同步列出知識庫中的所有文件"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url, headers=self._headers)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_delete_document(self, dataset_id: str, document_id: str) -> Dict[str, Any]:
        """非同步刪除指定文件"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        import json as _json
        headers = {**self._headers, 'Content-Type': 'application/json'}
        body = _json.dumps({'ids': [document_id]}).encode('utf-8')
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.request("DELETE", url, headers=headers, content=body)
            resp.raise_for_status()
            return self._check_response(resp.json())

    # ---------- 同步方法（向下相容，供 WatcherService 線程使用） ----------

    def upload_file(
        self,
        dataset_id: str,
        file_path: str,
        chunk_method: str = "naive",
        parser_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """同步上傳（WatcherService 在背景線程中使用）"""
        fp = Path(file_path)
        if not fp.exists():
            raise FileNotFoundError(f"檔案不存在: {fp}")

        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        content = fp.read_bytes()
        files = {'file': (fp.name, content, self._get_mime_type(fp))}

        with httpx.Client(timeout=60, headers=self._headers) as client:
            resp = client.post(url, files=files)
            resp.raise_for_status()
            return self._check_response(resp.json())

    def list_documents(self, dataset_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        with httpx.Client(timeout=30, headers=self._headers) as client:
            resp = client.get(url)
            resp.raise_for_status()
            return self._check_response(resp.json())

    def delete_document(self, dataset_id: str, document_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        import json as _json
        headers = {**self._headers, 'Content-Type': 'application/json'}
        body = _json.dumps({'ids': [document_id]}).encode('utf-8')
        with httpx.Client(timeout=30) as client:
            resp = client.request("DELETE", url, headers=headers, content=body)
            resp.raise_for_status()
            return self._check_response(resp.json())

    # ---------- 工具方法 ----------

    @staticmethod
    def _get_mime_type(file_path: Path) -> str:
        """根據副檔名判斷 MIME 類型"""
        mime_types = {
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.csv': 'text/csv',
            '.json': 'application/json',
            '.md': 'text/markdown',
        }
        return mime_types.get(file_path.suffix.lower(), 'application/octet-stream')
