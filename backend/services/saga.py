"""
Saga Orchestrator — 跨系統事務編排器 + Dead Letter Queue

設計原則：
1. Saga Pattern (Orchestration 模式) — 協調 RAGFlow + KuzuDB 的跨系統寫入
2. 每個步驟都有對應的補償操作 (Compensating Transaction)
3. Saga 日誌持久化到 SQLite，確保崩潰後可重播/補償
4. 補償失敗的操作寫入 DLQ，供管理員手動處理

Saga 流程：
  Step 1: RAGFlow Upload → 補償: RAGFlow Delete
  Step 2: KuzuDB Write   → 補償: KuzuDB Delete
  Step 3: Excel Parse     → 無補償 (可重試)

使用方式：
    saga = FileImportSaga(rag_client, kuzu_manager, dataset_id)
    result = await saga.execute(file_path, graph_id)
"""
import asyncio
import json
import logging
import sqlite3
import uuid
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional, Dict, Any, List

from backend.core.telemetry import get_tracer

logger = logging.getLogger(__name__)
_tracer = get_tracer("bruv.saga")

# Saga 日誌持久化路徑
import os
_DATA_DIR = Path(os.environ.get("BRUV_DATA_DIR", str(Path.home() / "BruV_Data")))
_SAGA_DB_PATH = _DATA_DIR / "saga_log.db"


class SagaStepStatus(str, Enum):
    """Saga 步驟狀態"""
    NOT_STARTED = "not_started"
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATED = "compensated"
    COMPENSATION_FAILED = "compensation_failed"


class SagaStatus(str, Enum):
    """Saga 整體狀態"""
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATING = "compensating"
    COMPENSATION_COMPLETE = "compensation_complete"
    COMPENSATION_FAILED = "compensation_failed"


class SagaLog:
    """
    Saga 日誌 — 記錄每個步驟的執行狀態

    持久化到 SQLite，確保崩潰後可恢復補償操作。
    """

    def __init__(self, saga_id: str = None, file_path: str = None):
        self.saga_id = saga_id or str(uuid.uuid4())
        self.file_path = file_path
        self.steps: Dict[str, Dict[str, Any]] = {}
        self.status = SagaStatus.RUNNING
        self.error: Optional[str] = None
        self.created_at = datetime.now()

        # 持久化
        _SAGA_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(_SAGA_DB_PATH), timeout=5)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS saga_logs (
                    saga_id TEXT PRIMARY KEY,
                    file_path TEXT,
                    status TEXT,
                    steps TEXT,
                    error TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)

    def record_step(self, step_name: str, status: str, **kwargs):
        """記錄步驟狀態"""
        self.steps[step_name] = {
            "status": status,
            "timestamp": datetime.now().isoformat(),
            **kwargs
        }
        self._persist()
        logger.debug(f"📝 Saga [{self.saga_id[:8]}] step={step_name} status={status}")

    def mark_saga_completed(self):
        self.status = SagaStatus.COMPLETED
        self._persist()
        logger.info(f"✅ Saga [{self.saga_id[:8]}] 完成")

    def mark_saga_failed(self, error: str):
        self.status = SagaStatus.FAILED
        self.error = error
        self._persist()
        logger.error(f"❌ Saga [{self.saga_id[:8]}] 失敗: {error}")

    def mark_compensation_complete(self):
        self.status = SagaStatus.COMPENSATION_COMPLETE
        self._persist()

    def mark_compensation_failed(self, error: str):
        self.status = SagaStatus.COMPENSATION_FAILED
        self.error = error
        self._persist()

    def get_completed_steps(self) -> List[str]:
        """取得所有已完成的步驟名稱"""
        return [
            name for name, step in self.steps.items()
            if step.get("status") == SagaStepStatus.COMPLETED.value
               or step.get("status") == "COMPLETED"
        ]

    def _persist(self):
        """持久化到 SQLite"""
        try:
            with self._get_conn() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO saga_logs
                    (saga_id, file_path, status, steps, error, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    self.saga_id,
                    self.file_path,
                    self.status.value,
                    json.dumps(self.steps, ensure_ascii=False),
                    self.error,
                    self.created_at.isoformat(),
                    datetime.now().isoformat(),
                ))
        except Exception as e:
            logger.warning(f"Saga 日誌持久化失敗: {e}")

    def to_dict(self) -> dict:
        return {
            "saga_id": self.saga_id,
            "file_path": self.file_path,
            "status": self.status.value,
            "steps": self.steps,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
        }


class FileImportSaga:
    """
    Saga 編排器：協調 RAGFlow 上傳 + KuzuDB 寫入的跨系統事務

    核心保證：
    - 成功：RAGFlow 和 KuzuDB 都寫入成功
    - 失敗：已完成的步驟全部反向補償，確保最終一致性
    - 補償失敗：寫入 DLQ，供管理員手動處理
    """

    def __init__(self, rag_client, kuzu_manager, dataset_id: str):
        self.rag_client = rag_client
        self.kuzu_manager = kuzu_manager
        self.dataset_id = dataset_id

    async def execute(
        self,
        file_path: Path,
        graph_id: str = "1",
        entity_id_generator=None,
        excel_parser=None,
    ) -> Dict[str, Any]:
        """
        執行 Saga — 完整的檔案匯入事務

        Args:
            file_path: 檔案路徑
            graph_id: 目標圖譜 ID
            entity_id_generator: 自訂 Entity ID 生成函式
            excel_parser: Excel 解析回呼函式

        Returns:
            Saga 執行結果字典
        """
        saga_log = SagaLog(file_path=str(file_path))
        ragflow_doc_id = None
        kuzu_entity_id = None

        with _tracer.start_as_current_span("saga.file_import") as saga_span:
            saga_span.set_attribute("saga.id", saga_log.saga_id)
            saga_span.set_attribute("saga.file_path", str(file_path))
            saga_span.set_attribute("saga.file_name", file_path.name)
            saga_span.set_attribute("saga.graph_id", graph_id)
            saga_span.set_attribute("saga.dataset_id", self.dataset_id)

            try:
                # ── Step 1: 上傳至 RAGFlow ──
                with _tracer.start_as_current_span("saga.step.ragflow_upload") as step_span:
                    step_span.set_attribute("saga.id", saga_log.saga_id)
                    step_span.set_attribute("saga.file_name", file_path.name)
                    step_span.set_attribute("saga.step", "ragflow_upload")

                    saga_log.record_step("ragflow_upload", status="STARTED")

                    upload_result = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.rag_client.upload_file(
                            dataset_id=self.dataset_id,
                            file_path=str(file_path)
                        )
                    )
                    ragflow_doc_id = self._extract_doc_id(upload_result)
                    step_span.set_attribute("saga.ragflow_doc_id", ragflow_doc_id or "")
                    saga_log.record_step(
                        "ragflow_upload",
                        status="COMPLETED",
                        doc_id=ragflow_doc_id
                    )

                # ── Step 2: 寫入 KuzuDB ──
                with _tracer.start_as_current_span("saga.step.kuzu_write") as step_span:
                    step_span.set_attribute("saga.id", saga_log.saga_id)
                    step_span.set_attribute("saga.file_name", file_path.name)
                    step_span.set_attribute("saga.step", "kuzu_write")

                    saga_log.record_step("kuzu_write", status="STARTED")

                    if entity_id_generator:
                        kuzu_entity_id = entity_id_generator(file_path, upload_result)
                    else:
                        import hashlib
                        file_hash = hashlib.md5(str(file_path.absolute()).encode()).hexdigest()
                        kuzu_entity_id = ragflow_doc_id or f"doc_{file_hash[:16]}"

                    step_span.set_attribute("saga.entity_id", kuzu_entity_id)

                    properties = {
                        'path': str(file_path.absolute()),
                        'size': file_path.stat().st_size,
                        'extension': file_path.suffix.lower(),
                        'dataset_id': self.dataset_id,
                        'document_id': ragflow_doc_id,
                    }

                    success = self.kuzu_manager.add_entity(
                        entity_id=kuzu_entity_id,
                        name=file_path.name,
                        entity_type='document',
                        properties=properties,
                        graph_id=graph_id
                    )
                    if not success:
                        raise RuntimeError(f"KuzuDB 寫入失敗: {kuzu_entity_id}")

                    saga_log.record_step(
                        "kuzu_write",
                        status="COMPLETED",
                        entity_id=kuzu_entity_id
                    )

                # ── Step 3: Excel 深度解析 (可選) ──
                if file_path.suffix.lower() == '.xlsx' and excel_parser:
                    with _tracer.start_as_current_span("saga.step.excel_parse") as step_span:
                        step_span.set_attribute("saga.id", saga_log.saga_id)
                        step_span.set_attribute("saga.file_name", file_path.name)
                        step_span.set_attribute("saga.step", "excel_parse")

                        saga_log.record_step("excel_parse", status="STARTED")
                        try:
                            excel_parser(file_path, kuzu_entity_id, graph_id)
                            saga_log.record_step("excel_parse", status="COMPLETED")
                        except Exception as excel_err:
                            saga_log.record_step(
                                "excel_parse",
                                status="FAILED",
                                error=str(excel_err)
                            )
                            step_span.record_exception(excel_err)
                            logger.warning(f"Excel 解析失敗 (不影響主流程): {excel_err}")

                saga_log.mark_saga_completed()
                saga_span.set_attribute("saga.status", "completed")

                return {
                    "success": True,
                    "saga_id": saga_log.saga_id,
                    "ragflow_doc_id": ragflow_doc_id,
                    "kuzu_entity_id": kuzu_entity_id,
                    "steps": saga_log.steps,
                }

            except Exception as e:
                logger.error(f"Saga 失敗，啟動補償: {e}")
                saga_span.record_exception(e)
                saga_span.set_attribute("saga.status", "compensating")
                saga_log.status = SagaStatus.COMPENSATING

                await self._compensate(saga_log, ragflow_doc_id, kuzu_entity_id)

                saga_log.mark_saga_failed(str(e))
                saga_span.set_attribute("saga.status", "failed")

                return {
                    "success": False,
                    "saga_id": saga_log.saga_id,
                    "error": str(e),
                    "steps": saga_log.steps,
                }

    async def _compensate(self, saga_log: SagaLog,
                          ragflow_doc_id: Optional[str],
                          kuzu_entity_id: Optional[str]):
        """反向補償：按 saga_log 反向撤銷已完成的步驟"""
        completed_steps = saga_log.get_completed_steps()
        all_compensated = True

        with _tracer.start_as_current_span("saga.compensate") as comp_span:
            comp_span.set_attribute("saga.id", saga_log.saga_id)
            comp_span.set_attribute("saga.file_path", saga_log.file_path)
            comp_span.set_attribute("saga.completed_steps", ",".join(completed_steps))

            # 反向順序補償
            if "kuzu_write" in completed_steps and kuzu_entity_id:
                try:
                    self.kuzu_manager.delete_entity(kuzu_entity_id)
                    saga_log.record_step("comp_kuzu_delete", status="COMPLETED")
                    logger.info(f"🔄 補償完成: 已刪除 KuzuDB 實體 {kuzu_entity_id}")
                except Exception as comp_err:
                    saga_log.record_step(
                        "comp_kuzu_delete",
                        status="FAILED",
                        error=str(comp_err)
                    )
                    comp_span.record_exception(comp_err)
                    logger.error(f"❌ 補償失敗 (KuzuDB): {comp_err}")
                    all_compensated = False

            if "ragflow_upload" in completed_steps and ragflow_doc_id:
                try:
                    await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.rag_client.delete_document(
                            dataset_id=self.dataset_id,
                            document_id=ragflow_doc_id
                        )
                    )
                    saga_log.record_step("comp_ragflow_delete", status="COMPLETED")
                    logger.info(f"🔄 補償完成: 已刪除 RAGFlow 文件 {ragflow_doc_id}")
                except Exception as comp_err:
                    saga_log.record_step(
                        "comp_ragflow_delete",
                        status="FAILED",
                        error=str(comp_err)
                    )
                    comp_span.record_exception(comp_err)
                    logger.error(f"❌ 補償失敗 (RAGFlow): {comp_err}")
                    all_compensated = False

            if all_compensated:
                saga_log.mark_compensation_complete()
                comp_span.set_attribute("saga.compensation_result", "success")
            else:
                saga_log.mark_compensation_failed("部分補償操作失敗，請查看 DLQ")
                comp_span.set_attribute("saga.compensation_result", "partial_failure")

    def _extract_doc_id(self, upload_result: dict) -> Optional[str]:
        """從 RAGFlow 上傳結果提取 document ID"""
        if not upload_result:
            return None
        data = upload_result.get('data')
        if isinstance(data, dict):
            return data.get('id')
        elif isinstance(data, list) and data:
            return data[0].get('id')
        return None


# ==================== Saga 查詢工具 ====================

def list_recent_sagas(limit: int = 50) -> List[dict]:
    """查詢最近的 Saga 執行記錄"""
    try:
        conn = sqlite3.connect(str(_SAGA_DB_PATH), timeout=5)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM saga_logs ORDER BY created_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"查詢 Saga 記錄失敗: {e}")
        return []


def get_saga_by_id(saga_id: str) -> Optional[dict]:
    """根據 ID 查詢 Saga 記錄"""
    try:
        conn = sqlite3.connect(str(_SAGA_DB_PATH), timeout=5)
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM saga_logs WHERE saga_id = ?",
            (saga_id,)
        ).fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception as e:
        logger.error(f"查詢 Saga 失敗: {e}")
        return None
