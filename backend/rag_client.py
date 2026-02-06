"""
RAGFlow API 客戶端
用於與本地 RAGFlow Server 進行文件上傳與管理
使用 httpx.AsyncClient 以避免阻塞 FastAPI 的 async 事件迴圈
"""
import httpx
from pathlib import Path
from typing import Optional, Dict, Any


class RAGFlowClient:
    """RAGFlow Server API 客戶端（非同步）"""

    def __init__(self, api_key: str, base_url: str = "http://localhost:81"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self._headers = {'Authorization': f'Bearer {api_key}'}

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

        url = f"{self.base_url}/document/upload"
        data = {'dataset_id': dataset_id, 'chunk_method': chunk_method}
        if parser_config:
            data['parser_config'] = str(parser_config)

        content = fp.read_bytes()
        files = {'file': (fp.name, content, self._get_mime_type(fp))}

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, headers=self._headers, files=files, data=data)
            resp.raise_for_status()
            return resp.json()

    async def async_list_documents(self, dataset_id: str) -> Dict[str, Any]:
        """非同步列出知識庫中的所有文件"""
        url = f"{self.base_url}/document/list"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url, headers=self._headers, params={'dataset_id': dataset_id})
            resp.raise_for_status()
            return resp.json()

    async def async_delete_document(self, document_id: str) -> Dict[str, Any]:
        """非同步刪除指定文件"""
        url = f"{self.base_url}/document/delete"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, headers=self._headers, json={'document_id': document_id})
            resp.raise_for_status()
            return resp.json()

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

        url = f"{self.base_url}/document/upload"
        data = {'dataset_id': dataset_id, 'chunk_method': chunk_method}
        if parser_config:
            data['parser_config'] = str(parser_config)

        content = fp.read_bytes()
        files = {'file': (fp.name, content, self._get_mime_type(fp))}

        with httpx.Client(timeout=60, headers=self._headers) as client:
            resp = client.post(url, files=files, data=data)
            resp.raise_for_status()
            return resp.json()

    def list_documents(self, dataset_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/document/list"
        with httpx.Client(timeout=30, headers=self._headers) as client:
            resp = client.get(url, params={'dataset_id': dataset_id})
            resp.raise_for_status()
            return resp.json()

    def delete_document(self, document_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/document/delete"
        with httpx.Client(timeout=30, headers=self._headers) as client:
            resp = client.post(url, json={'document_id': document_id})
            resp.raise_for_status()
            return resp.json()

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
