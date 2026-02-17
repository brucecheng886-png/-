"""
AI 檔案監控服務
監控指定目錄，自動上傳新檔案至 RAGFlow 並同步至知識圖譜
支援補償機制 (Compensation) 確保跨系統資料一致性

核心邏輯已拆分至:
  - file_processor.py  (Saga 流程 / RAGFlow 上傳 / KuzuDB 寫入 / Excel 解析)
  - node_linker.py     (Domain 歸類 / 關鍵字共現連線)
"""
import os
import time
import logging
import json
import uuid
import sqlite3
from pathlib import Path
from typing import Optional, Set, Union
from datetime import datetime

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

from backend.rag_client import RAGFlowClient
from backend.core.kuzu_manager import KuzuDBManager, MockKuzuManager, AsyncKuzuWrapper

# 拆分模組
from backend.services.file_processor import process_file as _process_file_impl
from backend.services.node_linker import build_inter_node_links

# 設置日誌
logger = logging.getLogger(__name__)

# DLQ (Dead Letter Queue) 路徑
_DATA_DIR = Path(os.environ.get("BRUV_DATA_DIR", str(Path.home() / "BruV_Data")))
_DLQ_DB_PATH = _DATA_DIR / "saga_dlq.db"

# 最大重試次數與退避基數
MAX_RETRY_ATTEMPTS = 3
RETRY_BACKOFF_BASE = 2  # seconds


class DeadLetterQueue:
    """
    死信佇列 — 記錄補償失敗或處理失敗的操作，
    供管理員透過 /api/system/saga-dlq 端點手動重試或確認。
    """

    def __init__(self, db_path: Path = _DLQ_DB_PATH):
        self._db_path = db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self._db_path), timeout=5)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS dlq (
                    id TEXT PRIMARY KEY,
                    file_path TEXT,
                    file_name TEXT,
                    graph_id TEXT,
                    failed_step TEXT,
                    error_message TEXT,
                    ragflow_doc_id TEXT,
                    kuzu_entity_id TEXT,
                    saga_steps TEXT,
                    created_at TEXT,
                    resolved BOOLEAN DEFAULT 0,
                    resolved_at TEXT
                )
            """)

    def record(self, file_path: Path, failed_step: str, error: str,
               ragflow_doc_id: str = None, kuzu_entity_id: str = None,
               graph_id: str = None, saga_steps: dict = None):
        """記錄到 DLQ"""
        try:
            with self._get_conn() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO dlq
                    (id, file_path, file_name, graph_id, failed_step,
                     error_message, ragflow_doc_id, kuzu_entity_id,
                     saga_steps, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(uuid.uuid4()),
                    str(file_path),
                    file_path.name if isinstance(file_path, Path) else str(file_path),
                    graph_id,
                    failed_step,
                    error,
                    ragflow_doc_id,
                    kuzu_entity_id,
                    json.dumps(saga_steps or {}, ensure_ascii=False),
                    datetime.now().isoformat(),
                ))
            logger.warning(f"📥 已記錄到 DLQ: {file_path} (step={failed_step})")
        except Exception as e:
            logger.error(f"❌ DLQ 寫入失敗: {e}")

    def list_unresolved(self, limit: int = 50) -> list:
        """列出未解決的 DLQ 項目"""
        try:
            with self._get_conn() as conn:
                rows = conn.execute(
                    "SELECT * FROM dlq WHERE resolved = 0 ORDER BY created_at DESC LIMIT ?",
                    (limit,)
                ).fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"❌ DLQ 查詢失敗: {e}")
            return []

    def mark_resolved(self, dlq_id: str) -> bool:
        """標記為已解決"""
        try:
            with self._get_conn() as conn:
                conn.execute(
                    "UPDATE dlq SET resolved = 1, resolved_at = ? WHERE id = ?",
                    (datetime.now().isoformat(), dlq_id)
                )
            return True
        except Exception as e:
            logger.error(f"❌ DLQ 標記失敗: {e}")
            return False


# 全域 DLQ 實例
dlq = DeadLetterQueue()


class AIFileEventHandler(FileSystemEventHandler):
    """AI 檔案事件處理器"""
    
    # 支援的檔案副檔名
    SUPPORTED_EXTENSIONS: Set[str] = {'.pdf', '.txt', '.md', '.docx', '.xlsx'}
    
    def __init__(self, rag_client: RAGFlowClient,
                 kuzu_manager: Optional[Union[KuzuDBManager, MockKuzuManager, AsyncKuzuWrapper]],
                 dataset_id: str):
        super().__init__()
        self.rag_client = rag_client
        self.kuzu_manager = kuzu_manager
        self.dataset_id = dataset_id
        logger.info(f"✅ AIFileEventHandler 初始化完成，目標知識庫: {dataset_id}")

    def on_created(self, event: FileSystemEvent) -> None:
        """偵測到新檔案時觸發"""
        if event.is_directory:
            return
        file_path = Path(event.src_path)
        if file_path.suffix == '.json' and '.meta.json' in file_path.name:
            return
        if file_path.suffix.lower() not in self.SUPPORTED_EXTENSIONS:
            return
        logger.info(f"🔍 偵測到新檔案: {file_path}")
        time.sleep(1)  # watchdog 回呼在獨立線程，不阻塞事件迴圈
        self._process_file(file_path)
    
    def _process_file(self, file_path: Path) -> None:
        """委派給 file_processor.process_file"""
        _process_file_impl(
            rag_client=self.rag_client,
            kuzu_manager=self.kuzu_manager,
            dataset_id=self.dataset_id,
            file_path=file_path,
            dlq=dlq,
            build_inter_node_links_fn=build_inter_node_links,
        )


class WatcherService:
    """檔案監控服務管理器"""
    
    def __init__(
        self,
        rag_client: RAGFlowClient,
        kuzu_manager: Optional[Union[KuzuDBManager, MockKuzuManager, AsyncKuzuWrapper]],
        dataset_id: str
    ):
        self.rag_client = rag_client
        self.kuzu_manager = kuzu_manager
        self.dataset_id = dataset_id
        self.observer: Optional[Observer] = None
        self.event_handler: Optional[AIFileEventHandler] = None
        self.watch_directory: Optional[str] = None
        logger.info("✅ WatcherService 初始化完成")
    
    def start(self, directory: str) -> None:
        """啟動檔案監控"""
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
        """處理啟動時目錄中已存在的檔案"""
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
                    # 冪等性檢查：如果已有 .meta.json 且標記 processed → 跳過
                    meta_path = file_path.with_suffix(
                        file_path.suffix + '.meta.json'
                    )
                    if meta_path.exists():
                        try:
                            with open(meta_path, 'r', encoding='utf-8') as mf:
                                meta = json.load(mf)
                            if meta.get('processed') is True:
                                file_mtime = datetime.fromtimestamp(
                                    file_path.stat().st_mtime
                                ).isoformat()
                                last_processed = meta.get(
                                    'last_processed_time', ''
                                )
                                if last_processed and file_mtime <= last_processed:
                                    logger.debug(
                                        f"⏩ 跳過已處理檔案: {file_path.name}"
                                    )
                                    skipped_count += 1
                                    continue
                        except Exception:
                            pass  # 元數據損壞，重新處理

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
        return self.observer is not None and self.observer.is_alive()
    
    def get_status(self) -> dict:
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
