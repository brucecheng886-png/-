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

        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(url, headers=self._headers, files=files)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_list_documents(self, dataset_id: str) -> Dict[str, Any]:
        """非同步列出知識庫中的所有文件"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.get(url, headers=self._headers)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_delete_document(self, dataset_id: str, document_id: str) -> Dict[str, Any]:
        """非同步刪除指定文件"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        import json as _json
        headers = {**self._headers, 'Content-Type': 'application/json'}
        body = _json.dumps({'ids': [document_id]}).encode('utf-8')
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.request("DELETE", url, headers=headers, content=body)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_delete_dataset(self, dataset_id: str) -> Dict[str, Any]:
        """非同步刪除整個知識庫 (dataset)"""
        url = f"{self.base_url}/datasets"
        import json as _json
        headers = {**self._headers, 'Content-Type': 'application/json'}
        body = _json.dumps({'ids': [dataset_id]}).encode('utf-8')
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.request("DELETE", url, headers=headers, content=body)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_update_document(
        self,
        dataset_id: str,
        document_id: str,
        chunk_method: str = "naive",
        parser_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """非同步更新文檔的解析器設定（chunk_method / parser_config）"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents/{document_id}"
        payload: Dict[str, Any] = {"chunk_method": chunk_method}
        if parser_config:
            payload["parser_config"] = parser_config
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.put(url, headers={**self._headers, 'Content-Type': 'application/json'}, json=payload)
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

        with httpx.Client(timeout=300, headers=self._headers) as client:
            resp = client.post(url, files=files)
            resp.raise_for_status()
            return self._check_response(resp.json())

    def list_documents(self, dataset_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        with httpx.Client(timeout=120, headers=self._headers) as client:
            resp = client.get(url)
            resp.raise_for_status()
            return self._check_response(resp.json())

    def delete_document(self, dataset_id: str, document_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/datasets/{dataset_id}/documents"
        import json as _json
        headers = {**self._headers, 'Content-Type': 'application/json'}
        body = _json.dumps({'ids': [document_id]}).encode('utf-8')
        with httpx.Client(timeout=120) as client:
            resp = client.request("DELETE", url, headers=headers, content=body)
            resp.raise_for_status()
            return self._check_response(resp.json())

    # ---------- Chunks 取回方法 ----------

    async def async_get_chunks(
        self,
        dataset_id: str,
        document_id: str,
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """非同步取回文件的解析分塊"""
        url = (f"{self.base_url}/datasets/{dataset_id}"
               f"/documents/{document_id}/chunks"
               f"?page={page}&page_size={page_size}")
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.get(url, headers=self._headers)
            resp.raise_for_status()
            return self._check_response(resp.json())

    def get_chunks(
        self,
        dataset_id: str,
        document_id: str,
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """同步取回文件的解析分塊（供 WatcherService 使用）"""
        url = (f"{self.base_url}/datasets/{dataset_id}"
               f"/documents/{document_id}/chunks"
               f"?page={page}&page_size={page_size}")
        with httpx.Client(timeout=120, headers=self._headers) as client:
            resp = client.get(url)
            resp.raise_for_status()
            return self._check_response(resp.json())

    async def async_get_document_status(
        self,
        dataset_id: str,
        document_id: str
    ) -> Dict[str, Any]:
        """非同步取得文件解析狀態"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents?id={document_id}"
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, headers=self._headers)
            resp.raise_for_status()
            result = self._check_response(resp.json())
            docs = result.get('data', {}).get('docs', [])
            return docs[0] if docs else {}

    def get_document_status(
        self,
        dataset_id: str,
        document_id: str
    ) -> Dict[str, Any]:
        """同步取得文件解析狀態"""
        url = f"{self.base_url}/datasets/{dataset_id}/documents?id={document_id}"
        with httpx.Client(timeout=15, headers=self._headers) as client:
            resp = client.get(url)
            resp.raise_for_status()
            result = self._check_response(resp.json())
            docs = result.get('data', {}).get('docs', [])
            return docs[0] if docs else {}

    # ---------- Hybrid Search / Retrieval ----------

    async def retrieve(
        self,
        question: str,
        dataset_ids: list[str],
        page: int = 1,
        page_size: int = 10,
        similarity_threshold: float = 0.4,
        vector_similarity_weight: float = 0.6,
        top_k: int = 256,
        rerank_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """混合檢索 (Hybrid Search) + 可選 Rerank

        Args:
            question: 查詢問題
            dataset_ids: 目標知識庫 ID 列表
            page / page_size: 分頁參數
            similarity_threshold: 最低相似度門檻 (0.4 過濾低品質結果)
            vector_similarity_weight: 向量 vs 關鍵字 權重 (0~1，0.6 偏語意搜尋)
            top_k: 初篩範圍 (256 適合中小型知識庫)
            rerank_id: Rerank 模型 ID（傳 None 則不啟用重排序）
        """
        payload: Dict[str, Any] = {
            "question": question,
            "dataset_ids": dataset_ids,
            "page": page,
            "page_size": page_size,
            "similarity_threshold": similarity_threshold,
            "vector_similarity_weight": vector_similarity_weight,
            "top_k": top_k,
        }
        if rerank_id is not None:
            payload["rerank_id"] = rerank_id

        url = f"{self.base_url}/retrieval"
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, headers=self._headers, json=payload)
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
