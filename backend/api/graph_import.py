"""
圖譜導入 API — 薄路由層

v5.0 — 路由定義 + 請求處理
核心邏輯已拆分至:
  - import_engine.py  (匯入引擎、LLM 呼叫、Checkpoint、任務管線)
  - import_prompts.py (Prompt 模板)
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from typing import List
import pandas as pd
import io
import logging
import uuid
import asyncio
from datetime import datetime

# ---- 從引擎模組匯入 ----
from .import_engine import (
    _import_tasks,
    _cleanup_expired_tasks,
    _compute_adaptive_batch_size,
    _run_import,
    FAST_MODE_THRESHOLD,
)

# ---- 向下相容：讓外部 import 這些符號時仍可用 ----
from .import_engine import (       # noqa: F401
    parse_llm_response,
    call_llm_analysis,
    call_llm_batch,
    call_llm_batch_with_retry,
)
from .import_prompts import (      # noqa: F401
    build_batch_prompt,
    build_batch_prompt_fast,
    build_node_analysis_prompt,
    SYSTEM_ROLE,
    NODE_SCHEMA,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ===== API 端點 =====

@router.post("/import/excel")
async def import_excel(
    request: Request,
    file: UploadFile = File(...),
    graph_id: str = Form(None),
    ragflow_dataset_id: str = Form(None),
):
    """
    導入 Excel/CSV 檔案並使用 LLM 智能解析（v5.0 完整整合版）

    功能:
    - 立即回傳 task_id，不再同步等待所有批次完成
    - 用 GET /import/status/{task_id} 查詢進度
    - 支援 3000+ 筆資料穩定處理
    - 自動寫入 KuzuDB 圖譜節點
    - 逐行上傳 RAGFlow 知識庫 (可選)
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="檔案名稱無效")

        filename = file.filename.lower()
        if not (filename.endswith('.xlsx') or filename.endswith('.csv')):
            raise HTTPException(
                status_code=400,
                detail="不支援的檔案格式，請上傳 .xlsx 或 .csv 檔案"
            )

        contents = await file.read()
        if filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))

        logger.info(
            f"成功讀取檔案: {file.filename}, "
            f"行數: {len(df)}, 欄位: {list(df.columns)}, "
            f"graph_id={graph_id}, ragflow_dataset_id={ragflow_dataset_id}"
        )

        if df.empty:
            raise HTTPException(status_code=400, detail="檔案內容為空")

        kuzu_manager = None
        if graph_id and hasattr(request.app.state, 'kuzu_manager'):
            kuzu_manager = request.app.state.kuzu_manager

        row_texts: List[str] = []
        row_names: List[str] = []
        first_col = str(df.columns[0])

        for row_idx, (idx, row) in enumerate(df.iterrows()):
            raw = " | ".join(
                f"{col}: {row[col]}" for col in df.columns if pd.notna(row[col])
            )
            row_texts.append(raw)
            name = (
                str(row[first_col])
                if first_col in row and pd.notna(row[first_col])
                else f"節點 {row_idx + 1}"
            )
            row_names.append(name)

        est_batch_size = _compute_adaptive_batch_size(row_texts)
        est_batches = (len(row_texts) + est_batch_size - 1) // est_batch_size
        fast_mode = len(row_texts) > FAST_MODE_THRESHOLD

        task_id = str(uuid.uuid4())
        _import_tasks[task_id] = {
            "status": "running",
            "total": len(row_texts),
            "completed": 0,
            "failed": 0,
            "progress_pct": 0.0,
            "started_at": datetime.now().isoformat(),
            "finished_at": None,
            "filename": file.filename,
            "graph_id": graph_id,
            "error": None,
            "batch_size": est_batch_size,
            "total_batches": est_batches,
            "completed_batches": 0,
            "fast_mode": fast_mode,
            "eta_seconds": None,
            "rows_per_sec": 0,
            "elapsed_seconds": None,
        }

        asyncio.create_task(_run_import(
            task_id, row_texts, row_names, df,
            graph_id=graph_id,
            ragflow_dataset_id=ragflow_dataset_id,
            kuzu_manager=kuzu_manager,
            http_client=getattr(request.app.state, 'http_client', None),
        ))

        mode_desc = "⚡快速模式" if fast_mode else "📝完整模式"
        logger.info(
            f"📤 匯入任務已啟動: task_id={task_id[:8]}..., "
            f"total={len(row_texts)}, batch_size={est_batch_size}, "
            f"batches={est_batches}, mode={mode_desc}"
        )

        return {
            "task_id": task_id,
            "total": len(row_texts),
            "graph_id": graph_id,
            "batch_size": est_batch_size,
            "total_batches": est_batches,
            "fast_mode": fast_mode,
            "message": f"匯入任務已啟動 ({mode_desc})，共 {len(row_texts)} 筆 → {est_batches} 批",
        }

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="檔案內容為空或格式錯誤")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"導入失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"導入失敗: {str(e)}")


@router.get("/import/status/{task_id}")
async def get_import_status(task_id: str):
    """查詢匯入任務即時狀態"""
    _cleanup_expired_tasks()

    task = _import_tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任務不存在或已過期")

    response = {
        "task_id": task_id,
        "status": task["status"],
        "total": task["total"],
        "completed": task["completed"],
        "failed": task["failed"],
        "progress_pct": task["progress_pct"],
        "filename": task.get("filename", ""),
        "graph_id": task.get("graph_id", ""),
        "kuzu_saved": task.get("kuzu_saved", 0),
        "ragflow_uploaded": task.get("ragflow_uploaded", 0),
        "started_at": task.get("started_at"),
        "finished_at": task.get("finished_at"),
        "eta_seconds": task.get("eta_seconds"),
        "rows_per_sec": task.get("rows_per_sec", 0),
        "batch_size": task.get("batch_size", 0),
        "total_batches": task.get("total_batches", 0),
        "completed_batches": task.get("completed_batches", 0),
        "fast_mode": task.get("fast_mode", False),
        "elapsed_seconds": task.get("elapsed_seconds"),
        "extracted_count": task.get("extracted_count", 0),
    }

    if task["status"] == "done":
        response["node_count"] = task.get("node_count", 0)

    if task["status"] == "error":
        response["error"] = task.get("error", "未知錯誤")

    return response


@router.get("/import/template")
async def download_template():
    """下載 Excel 導入模板"""
    return {
        "message": "模板下載功能開發中",
        "suggested_columns": ["標題", "內容", "類型", "標籤", "來源"]
    }


@router.get("/import/tasks")
async def list_import_tasks():
    """列出所有匯入任務"""
    tasks_summary = []
    for tid, task in _import_tasks.items():
        tasks_summary.append({
            "task_id": tid,
            "status": task["status"],
            "total": task["total"],
            "completed": task["completed"],
            "progress_pct": task["progress_pct"],
            "filename": task.get("filename", ""),
            "started_at": task.get("started_at"),
            "finished_at": task.get("finished_at"),
        })

    return {
        "tasks": tasks_summary,
        "count": len(tasks_summary),
    }
