"""
AI 檔案監控服務
監控指定目錄，自動上傳新檔案至 RAGFlow 並同步至知識圖譜
"""
import os
import time
import logging
import hashlib
import uuid
import asyncio
from pathlib import Path
from typing import Optional, Set, Union
import pandas as pd
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

from backend.rag_client import RAGFlowClient
from backend.core.kuzu_manager import KuzuDBManager, MockKuzuManager
from backend.services.task_queue import task_queue, TaskStatus

# 設置日誌
logger = logging.getLogger(__name__)


class AIFileEventHandler(FileSystemEventHandler):
    """AI 檔案事件處理器"""
    
    # 支援的檔案副檔名
    SUPPORTED_EXTENSIONS: Set[str] = {'.pdf', '.txt', '.md', '.docx', '.xlsx'}
    
    def __init__(
        self, 
        rag_client: RAGFlowClient, 
        kuzu_manager: Optional[Union[KuzuDBManager, MockKuzuManager]],
        dataset_id: str
    ):
        """
        初始化檔案事件處理器
        
        Args:
            rag_client: RAGFlow 客戶端實例
            kuzu_manager: KuzuDB 管理器實例（支持 KuzuDBManager、MockKuzuManager 或 None）
            dataset_id: RAGFlow 知識庫 ID
        """
        super().__init__()
        self.rag_client = rag_client
        self.kuzu_manager = kuzu_manager
        self.dataset_id = dataset_id
        logger.info(f"✅ AIFileEventHandler 初始化完成，目標知識庫: {dataset_id}")
    
    def on_created(self, event: FileSystemEvent) -> None:
        """
        當偵測到新檔案創建時觸發
        
        Args:
            event: 檔案系統事件
        """
        # 過濾掉資料夾
        if event.is_directory:
            logger.debug(f"⏭️  忽略目錄: {event.src_path}")
            return
        
        file_path = Path(event.src_path)
        
        # 忽略元數據文件
        if file_path.suffix == '.json' and '.meta.json' in file_path.name:
            logger.debug(f"⏭️  忽略元數據文件: {file_path.name}")
            return
        
        file_extension = file_path.suffix.lower()
        
        # 檢查副檔名是否支援
        if file_extension not in self.SUPPORTED_EXTENSIONS:
            logger.debug(f"⏭️  忽略不支援的檔案類型: {file_path.name} ({file_extension})")
            return
        
        logger.info(f"🔍 偵測到新檔案: {file_path}")
        
        # 等待檔案完全寫入（使用非阻塞睡眠替代 time.sleep）
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # 在 async 環境下，使用 thread-safe 方式等待
                import time as _time
                _time.sleep(1)  # watchdog 回呼在獨立線程，time.sleep 不阻塞事件迴圈
            else:
                time.sleep(1)
        except RuntimeError:
            time.sleep(1)
        
        # 處理檔案上傳與圖譜更新
        self._process_file(file_path)
    
    def _process_file(self, file_path: Path) -> None:
        """
        處理檔案：上傳至 RAGFlow 並更新知識圖譜
        
        Args:
            file_path: 檔案路徑
        """
        try:
            # 讀取圖譜元數據
            metadata_file = file_path.with_suffix(file_path.suffix + '.meta.json')
            graph_id = "1"  # 預設圖譜 ID
            
            if metadata_file.exists():
                try:
                    import json
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                        graph_id = metadata.get('graph_id', "1")
                        logger.info(f"📋 讀取圖譜元數據: graph_id={graph_id}")
                except Exception as e:
                    logger.warning(f"⚠️  讀取元數據失敗，使用預設圖譜: {e}")
            
            # 動作 A: 上傳檔案至 RAGFlow
            logger.info(f"📤 正在上傳檔案至 RAGFlow: {file_path.name}")
            
            upload_result = self.rag_client.upload_file(
                dataset_id=self.dataset_id,
                file_path=str(file_path)
            )
            
            logger.info(f"✅ 檔案上傳成功: {file_path.name}")
            logger.debug(f"上傳回應: {upload_result}")
            
            # 動作 B: 寫入知識圖譜（使用圖譜 ID）
            # 先創建檔案主節點
            file_node_id = self._add_to_graph(file_path, upload_result, graph_id)
            
            # 如果是 Excel 檔案，進行深度解析
            if file_path.suffix.lower() == '.xlsx' and file_node_id:
                self._parse_excel_and_link(file_path, file_node_id, graph_id)
            
        except FileNotFoundError as e:
            logger.error(f"❌ 檔案不存在: {file_path} - {e}")
        except Exception as e:
            logger.error(f"❌ 處理檔案失敗: {file_path.name} - {type(e).__name__}: {e}", exc_info=True)
    
    def _add_to_graph(self, file_path: Path, upload_result: dict, graph_id: str = "1") -> Optional[str]:
        """
        將檔案資訊添加到知識圖譜（創建檔案主節點）
        
        Args:
            file_path: 檔案路徑
            upload_result: RAGFlow 上傳回應
            graph_id: 目標圖譜 ID
            
        Returns:
            Optional[str]: 成功返回節點 ID，失敗返回 None
        """
        # 如果 KuzuDB 不可用，跳過圖譜寫入
        if not self.kuzu_manager:
            logger.debug(f"⏭️  KuzuDB 不可用，跳過圖譜寫入: {file_path.name}")
            return None
        
        try:
            # 提取 Entity ID（優先使用 RAGFlow 回傳的 ID）
            entity_id = self._extract_entity_id(file_path, upload_result)
            
            # 準備實體屬性
            properties = {
                'path': str(file_path.absolute()),
                'size': file_path.stat().st_size,
                'extension': file_path.suffix.lower(),
                'created_time': file_path.stat().st_ctime,
                'dataset_id': self.dataset_id
            }
            
            # 如果 RAGFlow 回傳了文檔 ID，也加入屬性
            if 'data' in upload_result and upload_result['data']:
                doc_data = upload_result['data']
                if isinstance(doc_data, dict):
                    properties['document_id'] = doc_data.get('id', entity_id)
                elif isinstance(doc_data, list) and len(doc_data) > 0:
                    properties['document_id'] = doc_data[0].get('id', entity_id)
            
            logger.info(f"📊 正在寫入知識圖譜: {file_path.name}")
            
            # 添加實體到圖譜（使用 graph_id）
            success = self.kuzu_manager.add_entity(
                entity_id=entity_id,
                name=file_path.name,
                entity_type='document',
                properties=properties,
                graph_id=graph_id  # 傳遞圖譜 ID
            )
            
            if success:
                logger.info(f"✅ 圖譜寫入成功: {file_path.name} (ID: {entity_id})")
                return entity_id  # 返回節點 ID
            else:
                logger.error(f"❌ 圖譜寫入失敗: {file_path.name}")
                return None
                
        except Exception as e:
            logger.error(f"❌ 添加到圖譜失敗: {file_path.name} - {type(e).__name__}: {e}", exc_info=True)
            return None
    
    def _extract_entity_id(self, file_path: Path, upload_result: dict) -> str:
        """
        提取實體 ID（優先使用 RAGFlow 回傳的 ID，否則使用檔案名稱的 Hash）
        
        Args:
            file_path: 檔案路徑
            upload_result: RAGFlow 上傳回應
            
        Returns:
            實體 ID
        """
        # 嘗試從 RAGFlow 回應中提取 ID
        if 'data' in upload_result and upload_result['data']:
            doc_data = upload_result['data']
            
            # 處理回應可能是字典或列表的情況
            if isinstance(doc_data, dict) and 'id' in doc_data:
                entity_id = doc_data['id']
                logger.debug(f"使用 RAGFlow 回傳的 ID: {entity_id}")
                return entity_id
            elif isinstance(doc_data, list) and len(doc_data) > 0 and 'id' in doc_data[0]:
                entity_id = doc_data[0]['id']
                logger.debug(f"使用 RAGFlow 回傳的 ID: {entity_id}")
                return entity_id
        
        # 否則使用檔案名稱的 Hash
        file_hash = hashlib.md5(str(file_path.absolute()).encode()).hexdigest()
        entity_id = f"doc_{file_hash[:16]}"
        logger.debug(f"使用 Hash ID: {entity_id}")
        return entity_id
    
    def _parse_excel_and_link(self, file_path: Path, file_node_id: str, graph_id: str = "1") -> None:
        """
        解析 Excel 檔案，將每一列資料轉換為獨立的圖譜子節點，並建立與主節點的連線
        
        Args:
            file_path: Excel 檔案路徑
            file_node_id: 檔案主節點的 ID
            graph_id: 目標圖譜 ID
        """
        # 如果 KuzuDB 不可用，跳過處理
        if not self.kuzu_manager:
            logger.debug(f"⏭️  KuzuDB 不可用，跳過 Excel 解析: {file_path.name}")
            return
        
        try:
            logger.info(f"📊 開始 Excel 深度解析: {file_path.name}")
            
            # 讀取 Excel 檔案
            df = pd.read_excel(file_path)
            
            # 將欄位名稱轉為小寫以進行不區分大小寫的匹配
            df.columns = df.columns.str.lower()
            
            # 檢查是否包含必要欄位（支持 description 和 distribtion）
            required_columns = ['srl', 'title', 'link']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            # 檢查是否有 description 或 distribtion
            has_description = 'description' in df.columns or 'distribtion' in df.columns
            if not has_description:
                missing_columns.append('description/distribtion')
            
            if missing_columns:
                logger.warning(
                    f"⚠️  Excel 檔案缺少必要欄位 {missing_columns}，跳過深度解析: {file_path.name}"
                )
                return
            
            logger.info(f"✅ Excel 格式驗證通過，包含 {len(df)} 列資料")
            
            # 遍歷每一列，創建子節點並建立連線
            success_count = 0
            error_count = 0
            link_count = 0
            
            for index, row in df.iterrows():
                try:
                    # 提取欄位值
                    srl = str(row.get('srl', '')).strip()
                    title = str(row.get('title', '')).strip()
                    link = str(row.get('link', '')).strip()
                    # 支持 description 或 distribtion
                    description = str(row.get('description', row.get('distribtion', ''))).strip()
                    
                    # 跳過空白列
                    if not srl or not title:
                        logger.debug(f"⏭️  跳過空白列 {index + 1}")
                        continue
                    
                    # 生成唯一的子節點 ID
                    child_node_id = f"{file_path.stem}_row_{srl}"
                    
                    # 準備節點屬性（將 link 和 description 放入 properties）
                    properties = {
                        'srl': srl,
                        'link': link,
                        'description': description,
                        'source_file': file_path.name,
                        'row_index': index + 1,
                        'dataset_id': self.dataset_id
                    }
                    
                    # 步驟 1: 創建子節點（使用 graph_id）
                    node_success = self.kuzu_manager.add_entity(
                        entity_id=child_node_id,
                        name=title,
                        entity_type='Resource',  # 對應前端配色
                        properties=properties,
                        graph_id=graph_id  # 傳遞圖譜 ID
                    )
                    
                    if node_success:
                        success_count += 1
                        logger.debug(f"✅ 列 {index + 1} 子節點創建成功: {title} (ID: {child_node_id})")
                        
                        # 步驟 2: 建立連線 (檔案主節點 -> 子節點)
                        link_success = self.kuzu_manager.add_relation(
                            source_id=file_node_id,
                            target_id=child_node_id,
                            relation_type="contains",
                            properties={'row': index + 1}
                        )
                        
                        if link_success:
                            link_count += 1
                            logger.debug(f"🔗 列 {index + 1} 連線創建成功: {file_node_id} -[contains]-> {child_node_id}")
                        else:
                            logger.warning(f"⚠️  列 {index + 1} 連線創建失敗")
                    else:
                        error_count += 1
                        logger.warning(f"⚠️  列 {index + 1} 子節點創建失敗: {title}")
                        
                except Exception as e:
                    error_count += 1
                    logger.error(
                        f"❌ 處理列 {index + 1} 失敗: {type(e).__name__}: {e}",
                        exc_info=True
                    )
            
            logger.info(
                f"📊 Excel 深度解析完成: {file_path.name} | "
                f"子節點: {success_count}, 連線: {link_count}, 失敗: {error_count}"
            )
            
        except pd.errors.EmptyDataError:
            logger.warning(f"⚠️  Excel 檔案為空: {file_path.name}")
        except pd.errors.ParserError as e:
            logger.error(f"❌ Excel 解析錯誤: {file_path.name} - {e}")
        except Exception as e:
            logger.error(
                f"❌ Excel 深度解析失敗: {file_path.name} - {type(e).__name__}: {e}",
                exc_info=True
            )


class WatcherService:
    """檔案監控服務管理器"""
    
    def __init__(
        self,
        rag_client: RAGFlowClient,
        kuzu_manager: Optional[Union[KuzuDBManager, MockKuzuManager]],
        dataset_id: str
    ):
        """
        初始化監控服務
        
        Args:
            rag_client: RAGFlow 客戶端實例
            kuzu_manager: KuzuDB 管理器實例（支持 KuzuDBManager、MockKuzuManager 或 None）
            dataset_id: RAGFlow 知識庫 ID
        """
        self.rag_client = rag_client
        self.kuzu_manager = kuzu_manager
        self.dataset_id = dataset_id
        self.observer: Optional[Observer] = None
        self.event_handler: Optional[AIFileEventHandler] = None
        self.watch_directory: Optional[str] = None
        
        logger.info("✅ WatcherService 初始化完成")
    
    def start(self, directory: str) -> None:
        """
        啟動檔案監控
        
        Args:
            directory: 要監控的目錄路徑
            
        Raises:
            FileNotFoundError: 目錄不存在
            RuntimeError: 監控服務已在運行
        """
        if self.observer is not None and self.observer.is_alive():
            raise RuntimeError("監控服務已在運行中")
        
        # 驗證目錄存在
        watch_path = Path(directory)
        if not watch_path.exists():
            raise FileNotFoundError(f"監控目錄不存在: {directory}")
        
        if not watch_path.is_dir():
            raise ValueError(f"路徑不是目錄: {directory}")
        
        # 創建事件處理器
        self.event_handler = AIFileEventHandler(
            rag_client=self.rag_client,
            kuzu_manager=self.kuzu_manager,
            dataset_id=self.dataset_id
        )
        
        # 創建並啟動 Observer
        self.observer = Observer()
        self.observer.schedule(
            self.event_handler,
            path=str(watch_path),
            recursive=True  # 遞迴監控子目錄
        )
        
        self.watch_directory = str(watch_path)
        self.observer.start()
        
        logger.info(f"🚀 檔案監控已啟動: {self.watch_directory}")
        logger.info(f"📁 監控模式: 遞迴監控所有子目錄")
        logger.info(f"📄 支援格式: {', '.join(AIFileEventHandler.SUPPORTED_EXTENSIONS)}")
        
        # 處理啟動時已存在的檔案
        self._process_existing_files(watch_path)
    
    def stop(self) -> None:
        """停止檔案監控"""
        if self.observer is None:
            logger.warning("⚠️  監控服務未啟動")
            return
        
        if not self.observer.is_alive():
            logger.warning("⚠️  監控服務未運行")
            return
        
        logger.info("🛑 正在停止檔案監控...")
        self.observer.stop()
        self.observer.join(timeout=5)
        
        logger.info(f"✅ 檔案監控已停止: {self.watch_directory}")
        self.observer = None
        self.event_handler = None
        self.watch_directory = None
    
    def _process_existing_files(self, directory: Path) -> None:
        """
        處理啟動時已存在的檔案
        
        Args:
            directory: 監控目錄路徑
        """
        logger.info("🔍 掃描已存在的檔案...")
        processed_count = 0
        skipped_count = 0
        
        try:
            # 遞迴掃描所有支援的檔案
            for file_path in directory.rglob("*"):
                # 跳過目錄
                if file_path.is_dir():
                    continue
                
                # 跳過元數據文件
                if file_path.suffix == '.json' and '.meta.json' in file_path.name:
                    skipped_count += 1
                    continue
                
                # 檢查副檔名
                if file_path.suffix.lower() in AIFileEventHandler.SUPPORTED_EXTENSIONS:
                    logger.info(f"📄 處理已存在的檔案: {file_path.name}")
                    if self.event_handler:
                        self.event_handler._process_file(file_path)
                        processed_count += 1
                else:
                    skipped_count += 1
            
            logger.info(f"✅ 已處理 {processed_count} 個檔案，跳過 {skipped_count} 個")
            
        except Exception as e:
            logger.error(f"❌ 掃描已存在檔案時發生錯誤: {e}", exc_info=True)
    
    def is_running(self) -> bool:
        """
        檢查監控服務是否正在運行
        
        Returns:
            True 如果正在運行，否則 False
        """
        return self.observer is not None and self.observer.is_alive()
    
    def get_status(self) -> dict:
        """
        獲取監控服務狀態
        
        Returns:
            狀態資訊字典
        """
        return {
            'running': self.is_running(),
            'watch_directory': self.watch_directory,
            'dataset_id': self.dataset_id,
            'supported_extensions': list(AIFileEventHandler.SUPPORTED_EXTENSIONS)
        }


# ============= 測試區塊 =============
if __name__ == "__main__":
    """
    測試監控服務
    """
    import sys
    
    # 配置日誌
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    try:
        # ===== 請填入以下參數 =====
        API_KEY = "ragflow-xxxxx"  # 替換成你的 RAGFlow API Key
        DATASET_ID = "your-dataset-id"  # 替換成你的知識庫 ID
        WATCH_DIR = "./test_watch"  # 替換成要監控的目錄
        DB_PATH = "C:/BruV_Data/kuzu_db"  # KuzuDB 統一資料庫路徑
        # =========================
        
        # 初始化客戶端
        logger.info("初始化 RAGFlow 客戶端...")
        rag_client = RAGFlowClient(api_key=API_KEY)
        
        logger.info("初始化 KuzuDB 管理器...")
        kuzu_manager = KuzuDBManager(db_path=DB_PATH)
        
        # 創建監控服務
        logger.info("創建監控服務...")
        watcher = WatcherService(
            rag_client=rag_client,
            kuzu_manager=kuzu_manager,
            dataset_id=DATASET_ID
        )
        
        # 確保監控目錄存在
        os.makedirs(WATCH_DIR, exist_ok=True)
        
        # 啟動監控
        watcher.start(WATCH_DIR)
        
        logger.info("=" * 60)
        logger.info("監控服務已啟動！")
        logger.info(f"請將檔案放入 {WATCH_DIR} 目錄進行測試")
        logger.info("按 Ctrl+C 停止監控")
        logger.info("=" * 60)
        
        # 保持運行
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("\n收到停止信號...")
            watcher.stop()
            logger.info("監控服務已停止")
            
    except Exception as e:
        logger.error(f"❌ 錯誤: {type(e).__name__}: {e}", exc_info=True)
        sys.exit(1)
