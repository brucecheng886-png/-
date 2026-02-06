"""
Agent Service - 智能代理核心服務
整合 RAG 檢索、自動化工具、意圖路由
"""
import re
import httpx
import logging
from typing import Dict, Any, Optional, List, Tuple
from enum import Enum

from backend.core.config import settings, get_current_api_keys

logger = logging.getLogger(__name__)


class IntentType(Enum):
    """意圖類型"""
    RAG = "rag"  # 知識檢索
    AUTOMATION = "automation"  # 系統自動化
    CHAT = "chat"  # 閒聊對話


class AgentService:
    """智能代理服務"""
    
    def __init__(self):
        # 配置來自統一 Settings，不再直接 os.getenv
        self.ragflow_api_url = settings.RAGFLOW_API_URL
        self.ragflow_api_key = settings.RAGFLOW_API_KEY
        self.dify_api_url = settings.DIFY_API_URL
        self.dify_api_key = settings.DIFY_API_KEY
        
        # 意圖識別關鍵字
        self.rag_keywords = [
            "查詢", "是什麼", "什麼是", "根據文件", "告訴我", 
            "說明", "解釋", "查找", "搜尋", "搜索", "找到"
        ]
        self.automation_keywords = [
            "修改", "設定", "重啟", "執行", "運行", "啟動", 
            "停止", "更新", "刪除", "建立", "創建"
        ]
    
    def detect_intent(self, user_message: str) -> IntentType:
        """
        意圖識別：根據用戶消息判斷意圖類型
        
        Args:
            user_message: 用戶輸入的消息
            
        Returns:
            IntentType: 識別出的意圖類型
        """
        # 轉小寫以便匹配
        message_lower = user_message.lower()
        
        # 檢查 RAG 關鍵字
        for keyword in self.rag_keywords:
            if keyword in user_message or keyword.lower() in message_lower:
                logger.info(f"✅ 意圖識別: RAG 模式 (關鍵字: {keyword})")
                return IntentType.RAG
        
        # 檢查自動化關鍵字
        for keyword in self.automation_keywords:
            if keyword in user_message or keyword.lower() in message_lower:
                logger.info(f"✅ 意圖識別: 自動化模式 (關鍵字: {keyword})")
                return IntentType.AUTOMATION
        
        # 默認為閒聊模式
        logger.info("✅ 意圖識別: 閒聊模式")
        return IntentType.CHAT
    
    async def query_knowledge_base(
        self, 
        question: str,
        dataset_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        RAG 檢索：從 RAGFlow 知識庫中檢索答案
        
        Args:
            question: 用戶問題
            dataset_id: 知識庫 ID（可選）
            
        Returns:
            包含答案和引用來源的字典
        """
        try:
            logger.info(f"📚 RAG 檢索開始: {question[:50]}...")
            
            # TODO: 根據 RAGFlow 官方 API 文檔調整請求格式
            # 目前使用 /v1/api/completion 端點
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                headers = {
                    "Authorization": f"Bearer {self.ragflow_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "question": question,
                    "stream": False
                }
                
                # 如果指定了知識庫 ID
                if dataset_id:
                    payload["dataset_id"] = dataset_id
                
                # 發送請求到 RAGFlow
                response = await client.post(
                    f"{self.ragflow_api_url}/completion",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # 解析 RAGFlow 回應
                    # 根據實際 API 格式調整
                    answer = data.get("answer", "抱歉，無法從知識庫中找到相關資訊。")
                    source_chunks = data.get("reference", [])
                    
                    logger.info(f"✅ RAG 檢索成功，找到 {len(source_chunks)} 個引用片段")
                    
                    return {
                        "success": True,
                        "answer": answer,
                        "source_documents": source_chunks,
                        "mode": "rag",
                        "metadata": {
                            "query": question,
                            "chunks_count": len(source_chunks)
                        }
                    }
                else:
                    logger.warning(f"⚠️ RAGFlow API 返回狀態碼: {response.status_code}")
                    return {
                        "success": False,
                        "answer": f"知識庫查詢失敗 (HTTP {response.status_code})",
                        "source_documents": [],
                        "mode": "rag",
                        "error": response.text
                    }
        
        except httpx.ConnectError:
            logger.error("❌ 無法連接到 RAGFlow API")
            return {
                "success": False,
                "answer": "⚠️ RAGFlow 服務未啟動或無法連接。請檢查 Docker 容器狀態。",
                "source_documents": [],
                "mode": "rag",
                "error": "Connection failed"
            }
        
        except Exception as e:
            logger.error(f"❌ RAG 檢索失敗: {e}", exc_info=True)
            return {
                "success": False,
                "answer": f"知識庫檢索時發生錯誤: {str(e)}",
                "source_documents": [],
                "mode": "rag",
                "error": str(e)
            }
    
    async def execute_system_command(self, user_message: str) -> Dict[str, Any]:
        """
        系統自動化：執行系統指令（目前為 Mock 實現）
        
        Args:
            user_message: 用戶輸入的指令
            
        Returns:
            執行結果字典
        """
        logger.info(f"🔧 自動化執行: {user_message[:50]}...")
        
        # Mock 實現 - 未來可接入真實 Docker/系統 API
        action_result = None
        message = user_message.lower()
        
        # 重啟服務
        if "重啟" in message or "restart" in message:
            if "docker" in message or "容器" in message or "服務" in message:
                action_result = {
                    "action": "restart_docker",
                    "status": "simulated",
                    "message": "🔄 正在執行 Docker Restart...",
                    "command": "docker compose restart",
                    "note": "這是模擬執行，未來將接入真實 Docker API"
                }
        
        # 查看狀態
        elif "狀態" in message or "status" in message:
            action_result = {
                "action": "check_status",
                "status": "success",
                "message": "✅ 所有服務運行正常",
                "services": {
                    "dify": "running",
                    "ragflow": "running",
                    "elasticsearch": "running",
                    "mysql": "running"
                }
            }
        
        # 停止服務
        elif "停止" in message or "stop" in message:
            action_result = {
                "action": "stop_service",
                "status": "simulated",
                "message": "⏸️ 正在停止服務...",
                "command": "docker compose stop",
                "note": "這是模擬執行"
            }
        
        # 修改設定
        elif "設定" in message or "配置" in message or "config" in message:
            action_result = {
                "action": "update_config",
                "status": "pending",
                "message": "⚙️ 請前往系統設定頁面進行修改",
                "url": "/settings"
            }
        
        # 默認回應
        else:
            action_result = {
                "action": "unknown",
                "status": "failed",
                "message": "🤔 無法理解您的指令。支援的操作：重啟服務、查看狀態、停止服務、修改設定。"
            }
        
        return {
            "success": True,
            "answer": action_result["message"],
            "action_result": action_result,
            "mode": "automation"
        }
    
    async def chat_casual(self, user_message: str) -> Dict[str, Any]:
        """
        閒聊模式：使用 Dify 進行一般對話
        
        Args:
            user_message: 用戶消息
            
        Returns:
            對話結果字典
        """
        try:
            logger.info(f"💬 閒聊模式: {user_message[:50]}...")
            
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
                headers = {
                    "Authorization": f"Bearer {self.dify_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "query": user_message,
                    "user": "default_user",
                    "response_mode": "blocking",
                    "inputs": {}
                }
                
                response = await client.post(
                    f"{self.dify_api_url}/chat-messages",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    answer = data.get("answer", "抱歉，我暫時無法回答這個問題。")
                    
                    return {
                        "success": True,
                        "answer": answer,
                        "mode": "chat",
                        "conversation_id": data.get("conversation_id")
                    }
                else:
                    logger.warning(f"⚠️ Dify API 返回狀態碼: {response.status_code}")
                    return {
                        "success": False,
                        "answer": "對話服務暫時不可用，請稍後再試。",
                        "mode": "chat",
                        "error": response.text
                    }
        
        except Exception as e:
            logger.error(f"❌ 閒聊失敗: {e}", exc_info=True)
            return {
                "success": False,
                "answer": "對話時發生錯誤，請稍後再試。",
                "mode": "chat",
                "error": str(e)
            }
    
    async def process_message(
        self, 
        user_message: str,
        dataset_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Agent 主入口：處理用戶消息
        
        流程：
        1. 意圖識別
        2. 路由到對應模式
        3. 返回統一格式結果
        
        Args:
            user_message: 用戶消息
            dataset_id: 知識庫 ID（RAG 模式時使用）
            
        Returns:
            處理結果字典
        """
        # 步驟 1: 意圖識別
        intent = self.detect_intent(user_message)
        
        # 步驟 2: 路由到對應處理模式
        if intent == IntentType.RAG:
            result = await self.query_knowledge_base(user_message, dataset_id)
        elif intent == IntentType.AUTOMATION:
            result = await self.execute_system_command(user_message)
        else:  # IntentType.CHAT
            result = await self.chat_casual(user_message)
        
        # 添加意圖標籤
        result["detected_intent"] = intent.value
        
        return result


# 全局單例
agent_service = AgentService()
