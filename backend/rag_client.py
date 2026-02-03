"""
RAGFlow API 客戶端
用於與本地 RAGFlow Server 進行文件上傳與管理
"""
import os
import requests
from pathlib import Path
from typing import Optional, Dict, Any


class RAGFlowClient:
    """RAGFlow Server API 客戶端"""
    
    def __init__(self, api_key: str, base_url: str = "http://localhost:81"):
        """
        初始化 RAGFlow 客戶端
        
        Args:
            api_key: RAGFlow API Key
            base_url: RAGFlow Server 地址（預設 http://localhost:81）
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}'
        })
    
    def upload_file(
        self, 
        dataset_id: str, 
        file_path: str,
        chunk_method: str = "naive",
        parser_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        上傳文件到指定的知識庫
        
        Args:
            dataset_id: 知識庫 ID
            file_path: 要上傳的檔案路徑
            chunk_method: 分塊方法 (naive, qa, manual 等)
            parser_config: 解析器配置（可選）
        
        Returns:
            API 回應的 JSON 資料
        
        Raises:
            FileNotFoundError: 檔案不存在
            requests.HTTPError: API 請求失敗
        """
        file_path = Path(file_path)
        
        # 檢查檔案是否存在
        if not file_path.exists():
            raise FileNotFoundError(f"檔案不存在: {file_path}")
        
        # 準備上傳
        url = f"{self.base_url}/v1/api/document/upload"
        
        # 準備 multipart/form-data
        with open(file_path, 'rb') as f:
            files = {
                'file': (file_path.name, f, self._get_mime_type(file_path))
            }
            
            data = {
                'dataset_id': dataset_id,
                'chunk_method': chunk_method
            }
            
            # 如果有解析器配置
            if parser_config:
                data['parser_config'] = str(parser_config)
            
            # 發送請求
            response = self.session.post(url, files=files, data=data)
        
        # 檢查回應
        response.raise_for_status()
        return response.json()
    
    def list_documents(self, dataset_id: str) -> Dict[str, Any]:
        """
        列出知識庫中的所有文件
        
        Args:
            dataset_id: 知識庫 ID
        
        Returns:
            文件列表
        """
        url = f"{self.base_url}/v1/api/document/list"
        params = {'dataset_id': dataset_id}
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def delete_document(self, document_id: str) -> Dict[str, Any]:
        """
        刪除指定文件
        
        Args:
            document_id: 文件 ID
        
        Returns:
            刪除結果
        """
        url = f"{self.base_url}/v1/api/document/delete"
        data = {'document_id': document_id}
        response = self.session.post(url, json=data)
        response.raise_for_status()
        return response.json()
    
    def _get_mime_type(self, file_path: Path) -> str:
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


# ============= 測試區塊 =============
if __name__ == "__main__":
    """
    測試上傳功能
    使用前請先填入你的 API Key 和 Dataset ID
    """
    
    # ===== 請填入以下參數 =====
    API_KEY = "ragflow-xxxxxx"  # 替換成你的 RAGFlow API Key
    DATASET_ID = "your-dataset-id"  # 替換成你的知識庫 ID
    TEST_FILE = "test.pdf"  # 替換成要測試的檔案路徑
    # =========================
    
    try:
        # 初始化客戶端
        print("🚀 初始化 RAGFlow 客戶端...")
        client = RAGFlowClient(api_key=API_KEY)
        
        # 上傳檔案
        print(f"📤 上傳檔案: {TEST_FILE}")
        result = client.upload_file(
            dataset_id=DATASET_ID,
            file_path=TEST_FILE
        )
        
        print("✅ 上傳成功！")
        print(f"回應資料: {result}")
        
        # 列出文件
        print("\n📋 列出知識庫中的文件...")
        documents = client.list_documents(dataset_id=DATASET_ID)
        print(f"文件總數: {len(documents.get('data', []))}")
        
    except FileNotFoundError as e:
        print(f"❌ 錯誤: {e}")
        print("提示: 請確認測試檔案存在")
    except requests.HTTPError as e:
        print(f"❌ API 請求失敗: {e}")
        print(f"回應內容: {e.response.text}")
    except Exception as e:
        print(f"❌ 未預期的錯誤: {e}")
