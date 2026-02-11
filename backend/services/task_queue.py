"""
后台任务队列管理器
支持文件处理任务在用户离开页面后继续运行
任务元数据持久化到 SQLite，防止重啟後丟失

架構說明：
  - TaskBackend (Protocol) — 抽象介面，定義任務後端必須實作的方法
  - TaskQueue — 門面 (Facade)，根據 TASK_BACKEND 環境變數選擇後端
  - 現階段使用 SQLite 單機後端，Phase 4 可切換為 Celery/Redis 叢集後端
  - 切換方式: .env 中設定 TASK_BACKEND=celery + CELERY_BROKER_URL=redis://...
"""
import asyncio
import logging
import os
import uuid
import json
import sqlite3
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, Optional, Callable, Any, List, Protocol, runtime_checkable
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# 持久化路徑
_DATA_DIR = Path(os.environ.get(
    "BRUV_DATA_DIR",
    str(Path.home() / "BruV_Data")
))
_TASK_DB_PATH = _DATA_DIR / "task_queue.db"

# 最大歷史記錄數（超過時自動清理已完成/失敗的舊任務）
MAX_TASK_HISTORY = 500


# ==================== 抽象介面 (Protocol) ====================

@runtime_checkable
class TaskBackend(Protocol):
    """
    任務佇列後端抽象介面

    Phase 1 (現在): SQLite 單機後端 — TaskQueue 直接實作此介面
    Phase 4 (叢集): CeleryTaskBackend / RedisTaskBackend
    遵循 OCP (開放封閉原則) — 擴展新後端不需修改現有程式碼

    使用範例:
        # Phase 1: 預設 SQLite
        queue = create_task_queue()

        # Phase 4: 切換為 Celery (只改 .env)
        # TASK_BACKEND=celery
        # CELERY_BROKER_URL=redis://redis:6379/2
        queue = create_task_queue()
    """

    def create_task(self, task_type: str, **kwargs) -> str:
        """建立新任務，回傳任務 ID"""
        ...

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """查詢單個任務"""
        ...

    def get_all_tasks(self) -> Dict[str, Any]:
        """查詢所有任務"""
        ...

    def update_task_status(self, task_id: str, status: 'TaskStatus', **kwargs) -> None:
        """更新任務狀態"""
        ...

    def update_task_progress(self, task_id: str, processed_items: int, **kwargs) -> None:
        """更新任務進度"""
        ...

    def set_task_result(self, task_id: str, result: Dict[str, Any]) -> None:
        """設定任務結果"""
        ...

    async def start_worker(self) -> None:
        """啟動後台工作者"""
        ...

    async def stop_worker(self) -> None:
        """停止後台工作者"""
        ...


def create_task_queue(backend_type: str = None) -> 'TaskQueue':
    """
    工廠函式 — 根據配置建立 TaskQueue

    Args:
        backend_type: "sqlite" (預設) 或 "celery" (Phase 4)

    Returns:
        TaskQueue 實例
    """
    if backend_type is None:
        backend_type = os.environ.get("TASK_BACKEND", "sqlite")

    if backend_type == "celery":
        # Phase 4: Celery 後端 (尚未實作，預留介面)
        logger.warning("Celery 後端尚未實作，回退到 SQLite 後端")
        # from backend.services.celery_backend import CeleryTaskBackend
        # broker = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/2")
        # return CeleryTaskBackend(broker)

    return TaskQueue()


class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"  # 等待中
    PROCESSING = "processing"  # 处理中
    COMPLETED = "completed"  # 已完成
    FAILED = "failed"  # 失败


@dataclass
class Task:
    """任务数据类"""
    id: str
    type: str  # 任务类型: 'file_upload', 'excel_parse', etc.
    status: TaskStatus
    created_at: datetime
    file_path: Optional[Path] = None
    file_name: Optional[str] = None
    graph_id: Optional[str] = None
    dataset_id: Optional[str] = None
    progress: int = 0  # 0-100
    total_items: int = 0
    processed_items: int = 0
    failed_items: int = 0
    current_stage: str = "初始化"
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'id': self.id,
            'type': self.type,
            'status': self.status.value,
            'file_name': self.file_name,
            'graph_id': self.graph_id,
            'progress': self.progress,
            'total_items': self.total_items,
            'processed_items': self.processed_items,
            'failed_items': self.failed_items,
            'current_stage': self.current_stage,
            'result': self.result,
            'error': self.error,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }


class TaskQueue:
    """后台任务队列管理器"""
    
    def __init__(self):
        """初始化任务队列（含 SQLite 持久化）"""
        self._tasks: Dict[str, Task] = {}
        self._queue: asyncio.Queue = asyncio.Queue()
        self._worker_task: Optional[asyncio.Task] = None
        self._is_running = False

        # 初始化 SQLite
        _TASK_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._load_from_db()

        logger.info("TaskQueue 初始化完成")

    # ---------- SQLite 持久化 ----------

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(_TASK_DB_PATH), timeout=5)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    type TEXT,
                    status TEXT,
                    file_name TEXT,
                    graph_id TEXT,
                    dataset_id TEXT,
                    progress INTEGER DEFAULT 0,
                    total_items INTEGER DEFAULT 0,
                    processed_items INTEGER DEFAULT 0,
                    failed_items INTEGER DEFAULT 0,
                    current_stage TEXT DEFAULT '初始化',
                    result TEXT,
                    error TEXT,
                    created_at TEXT,
                    started_at TEXT,
                    completed_at TEXT
                )
            """)

    def _load_from_db(self):
        """啟動時載入未完成的任務"""
        try:
            with self._get_conn() as conn:
                rows = conn.execute(
                    "SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?",
                    (MAX_TASK_HISTORY,)
                ).fetchall()
                for row in rows:
                    task = Task(
                        id=row['id'],
                        type=row['type'],
                        status=TaskStatus(row['status']),
                        created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else datetime.now(),
                        file_name=row['file_name'],
                        graph_id=row['graph_id'],
                        dataset_id=row['dataset_id'],
                        progress=row['progress'],
                        total_items=row['total_items'],
                        processed_items=row['processed_items'],
                        failed_items=row['failed_items'],
                        current_stage=row['current_stage'] or '初始化',
                        result=json.loads(row['result']) if row['result'] else None,
                        error=row['error'],
                        started_at=datetime.fromisoformat(row['started_at']) if row['started_at'] else None,
                        completed_at=datetime.fromisoformat(row['completed_at']) if row['completed_at'] else None,
                    )
                    self._tasks[task.id] = task
                logger.info(f"從 SQLite 載入 {len(self._tasks)} 個任務記錄")
        except Exception as e:
            logger.warning(f"載入任務記錄失敗: {e}")

    def _persist_task(self, task: Task):
        """保存單個任務到 SQLite"""
        try:
            with self._get_conn() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO tasks
                    (id, type, status, file_name, graph_id, dataset_id,
                     progress, total_items, processed_items, failed_items,
                     current_stage, result, error, created_at, started_at, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    task.id, task.type, task.status.value, task.file_name,
                    task.graph_id, task.dataset_id, task.progress,
                    task.total_items, task.processed_items, task.failed_items,
                    task.current_stage,
                    json.dumps(task.result, ensure_ascii=False) if task.result else None,
                    task.error,
                    task.created_at.isoformat() if task.created_at else None,
                    task.started_at.isoformat() if task.started_at else None,
                    task.completed_at.isoformat() if task.completed_at else None,
                ))
        except Exception as e:
            logger.warning(f"持久化任務失敗: {e}")

    def _cleanup_old_tasks(self):
        """清理超出限制的歷史任務"""
        try:
            with self._get_conn() as conn:
                conn.execute("""
                    DELETE FROM tasks WHERE id IN (
                        SELECT id FROM tasks
                        WHERE status IN ('completed', 'failed')
                        ORDER BY completed_at DESC
                        LIMIT -1 OFFSET ?
                    )
                """, (MAX_TASK_HISTORY,))
                # 同步記憶體
                expired = [tid for tid, t in self._tasks.items()
                           if t.status in (TaskStatus.COMPLETED, TaskStatus.FAILED)]
                if len(expired) > MAX_TASK_HISTORY:
                    for tid in sorted(expired, key=lambda x: self._tasks[x].completed_at or datetime.min)[:-MAX_TASK_HISTORY]:
                        del self._tasks[tid]
        except Exception as e:
            logger.debug(f"清理舊任務失敗: {e}")
    
    def create_task(
        self,
        task_type: str,
        file_path: Optional[Path] = None,
        file_name: Optional[str] = None,
        graph_id: Optional[str] = None,
        dataset_id: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        创建新任务
        
        Args:
            task_type: 任务类型
            file_path: 文件路径
            file_name: 文件名
            graph_id: 图谱 ID
            dataset_id: 数据集 ID
            **kwargs: 其他参数
            
        Returns:
            任务 ID
        """
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            type=task_type,
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
            file_path=file_path,
            file_name=file_name or (file_path.name if file_path else None),
            graph_id=graph_id,
            dataset_id=dataset_id,
            **kwargs
        )
        
        self._tasks[task_id] = task
        self._persist_task(task)
        self._cleanup_old_tasks()
        logger.info(f"📝 创建任务: {task_id} ({task_type}) - {file_name}")
        
        return task_id
    
    async def add_task(
        self,
        task_id: str,
        handler: Callable,
        *args,
        **kwargs
    ) -> None:
        """
        添加任务到队列
        
        Args:
            task_id: 任务 ID
            handler: 处理函数
            *args: 位置参数
            **kwargs: 关键字参数
        """
        if task_id not in self._tasks:
            raise ValueError(f"任务不存在: {task_id}")
        
        await self._queue.put((task_id, handler, args, kwargs))
        logger.info(f"➕ 任务已加入队列: {task_id}")
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """获取任务信息"""
        return self._tasks.get(task_id)
    
    def get_all_tasks(self) -> Dict[str, Task]:
        """获取所有任务"""
        return self._tasks
    
    def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        progress: Optional[int] = None,
        current_stage: Optional[str] = None,
        error: Optional[str] = None
    ) -> None:
        """更新任务状态"""
        if task_id not in self._tasks:
            logger.warning(f"⚠️  任务不存在: {task_id}")
            return
        
        task = self._tasks[task_id]
        task.status = status
        
        if progress is not None:
            task.progress = progress
        
        if current_stage:
            task.current_stage = current_stage
        
        if error:
            task.error = error
        
        if status == TaskStatus.PROCESSING and not task.started_at:
            task.started_at = datetime.now()
        
        if status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
            task.completed_at = datetime.now()
        
        self._persist_task(task)
        logger.debug(f"🔄 任务状态更新: {task_id} -> {status.value} ({progress}%)")
    
    def update_task_progress(
        self,
        task_id: str,
        processed_items: int,
        total_items: Optional[int] = None,
        failed_items: Optional[int] = None
    ) -> None:
        """更新任务进度"""
        if task_id not in self._tasks:
            return
        
        task = self._tasks[task_id]
        task.processed_items = processed_items
        
        if total_items is not None:
            task.total_items = total_items
        
        if failed_items is not None:
            task.failed_items = failed_items
        
        # 计算进度百分比
        if task.total_items > 0:
            task.progress = int((processed_items / task.total_items) * 100)
        
        self._persist_task(task)
    
    def set_task_result(self, task_id: str, result: Dict[str, Any]) -> None:
        """设置任务结果"""
        if task_id not in self._tasks:
            return
        
        task = self._tasks[task_id]
        task.result = result
        self._persist_task(task)
        logger.info(f"✅ 任务结果已保存: {task_id}")
    
    async def start_worker(self) -> None:
        """启动后台工作线程"""
        if self._is_running:
            logger.warning("⚠️  工作线程已在运行")
            return
        
        self._is_running = True
        self._worker_task = asyncio.create_task(self._worker())
        logger.info("🚀 后台任务工作线程已启动")
    
    async def stop_worker(self) -> None:
        """停止后台工作线程"""
        if not self._is_running:
            return
        
        self._is_running = False
        
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        
        logger.info("🛑 后台任务工作线程已停止")
    
    async def _worker(self) -> None:
        """后台工作线程"""
        logger.info("👷 后台工作线程开始处理任务...")
        
        while self._is_running:
            try:
                # 获取任务 (超时 1 秒)
                try:
                    task_id, handler, args, kwargs = await asyncio.wait_for(
                        self._queue.get(),
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                # 更新状态为处理中
                self.update_task_status(
                    task_id,
                    TaskStatus.PROCESSING,
                    progress=0,
                    current_stage="开始处理"
                )
                
                logger.info(f"🔧 开始处理任务: {task_id}")
                
                try:
                    # 执行处理函数
                    if asyncio.iscoroutinefunction(handler):
                        result = await handler(task_id, *args, **kwargs)
                    else:
                        result = handler(task_id, *args, **kwargs)
                    
                    # 标记为完成
                    self.update_task_status(
                        task_id,
                        TaskStatus.COMPLETED,
                        progress=100,
                        current_stage="处理完成"
                    )
                    
                    if result:
                        self.set_task_result(task_id, result)
                    
                    logger.info(f"✅ 任务完成: {task_id}")
                    
                except Exception as e:
                    # 标记为失败
                    error_msg = f"{type(e).__name__}: {str(e)}"
                    self.update_task_status(
                        task_id,
                        TaskStatus.FAILED,
                        current_stage="处理失败",
                        error=error_msg
                    )
                    logger.error(f"❌ 任务失败: {task_id} - {error_msg}", exc_info=True)
                
                finally:
                    self._queue.task_done()
            
            except asyncio.CancelledError:
                logger.info("👋 工作线程收到取消信号")
                break
            
            except Exception as e:
                logger.error(f"❌ 工作线程错误: {e}", exc_info=True)
                await asyncio.sleep(1)


# 全局任务队列实例
task_queue = TaskQueue()
