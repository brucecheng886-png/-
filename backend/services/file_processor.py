"""
檔案處理引擎 — 從 watcher.py 拆分

負責：
  - Saga 流程 (RAGFlow 上傳 → KuzuDB 寫入 → Excel 深度解析 → 節點互連)
  - RAGFlow doc ID 擷取
  - KuzuDB 節點寫入
  - Excel 深度解析與子節點建立
"""
import time
import logging
import hashlib
import json
from pathlib import Path
from typing import Optional
from datetime import datetime

import pandas as pd

from backend.rag_client import RAGFlowClient

logger = logging.getLogger(__name__)

# 最大重試次數與退避基數
MAX_RETRY_ATTEMPTS = 3
RETRY_BACKOFF_BASE = 2  # seconds


# ================================================================
# RAGFlow 相關
# ================================================================

def extract_ragflow_doc_id(upload_result: dict) -> Optional[str]:
    """從 RAGFlow 上傳結果中提取 document ID"""
    if not upload_result:
        return None
    data = upload_result.get('data')
    if isinstance(data, dict):
        return data.get('id')
    elif isinstance(data, list) and data:
        return data[0].get('id')
    return None


def extract_entity_id(file_path: Path, upload_result: dict) -> str:
    """
    提取實體 ID（優先使用 RAGFlow 回傳的 ID，否則使用檔案名稱的 Hash）
    """
    if 'data' in upload_result and upload_result['data']:
        doc_data = upload_result['data']
        if isinstance(doc_data, dict) and 'id' in doc_data:
            entity_id = doc_data['id']
            logger.debug(f"使用 RAGFlow 回傳的 ID: {entity_id}")
            return entity_id
        elif isinstance(doc_data, list) and len(doc_data) > 0 and 'id' in doc_data[0]:
            entity_id = doc_data[0]['id']
            logger.debug(f"使用 RAGFlow 回傳的 ID: {entity_id}")
            return entity_id

    file_hash = hashlib.md5(str(file_path.absolute()).encode()).hexdigest()
    entity_id = f"doc_{file_hash[:16]}"
    logger.debug(f"使用 Hash ID: {entity_id}")
    return entity_id


# ================================================================
# KuzuDB 寫入
# ================================================================

def add_to_graph(kuzu_manager, file_path: Path, upload_result: dict,
                 graph_id: str, dataset_id: str) -> Optional[str]:
    """
    將檔案資訊添加到知識圖譜（創建檔案主節點）

    Returns:
        成功返回節點 ID，失敗或 kuzu_manager 不可用返回 None
    """
    if not kuzu_manager:
        logger.debug(f"⏭️  KuzuDB 不可用，跳過圖譜寫入: {file_path.name}")
        return None

    try:
        entity_id = extract_entity_id(file_path, upload_result)

        properties = {
            'path': str(file_path.absolute()),
            'size': file_path.stat().st_size,
            'extension': file_path.suffix.lower(),
            'created_time': file_path.stat().st_ctime,
            'dataset_id': dataset_id,
        }

        if 'data' in upload_result and upload_result['data']:
            doc_data = upload_result['data']
            if isinstance(doc_data, dict):
                properties['document_id'] = doc_data.get('id', entity_id)
            elif isinstance(doc_data, list) and len(doc_data) > 0:
                properties['document_id'] = doc_data[0].get('id', entity_id)

        logger.info(f"📊 正在寫入知識圖譜: {file_path.name}")

        success = kuzu_manager.add_entity(
            entity_id=entity_id,
            name=file_path.name,
            entity_type='document',
            properties=properties,
            graph_id=graph_id,
        )

        if success:
            logger.info(f"✅ 圖譜寫入成功: {file_path.name} (ID: {entity_id})")
            return entity_id
        else:
            logger.error(f"❌ 圖譜寫入失敗: {file_path.name}")
            return None

    except Exception as e:
        logger.error(f"❌ 添加到圖譜失敗: {file_path.name} - {type(e).__name__}: {e}", exc_info=True)
        return None


# ================================================================
# Excel 深度解析
# ================================================================

def parse_excel_and_link(kuzu_manager, file_path: Path, file_node_id: str,
                         graph_id: str = "1", dataset_id: str = "") -> None:
    """
    解析 Excel 檔案，將每一列資料轉換為獨立的圖譜子節點，
    並建立與主節點的連線。
    """
    if not kuzu_manager:
        logger.debug(f"⏭️  KuzuDB 不可用，跳過 Excel 解析: {file_path.name}")
        return

    try:
        logger.info(f"📊 開始 Excel 深度解析: {file_path.name}")

        df = pd.read_excel(file_path)
        df.columns = df.columns.str.lower()

        required_columns = ['srl', 'title', 'link']
        missing_columns = [col for col in required_columns if col not in df.columns]

        has_description = 'description' in df.columns or 'distribtion' in df.columns
        if not has_description:
            missing_columns.append('description/distribtion')

        if missing_columns:
            logger.warning(
                f"⚠️  Excel 檔案缺少必要欄位 {missing_columns}，跳過深度解析: {file_path.name}"
            )
            return

        logger.info(f"✅ Excel 格式驗證通過，包含 {len(df)} 列資料")

        success_count = 0
        error_count = 0
        link_count = 0

        for index, row in df.iterrows():
            try:
                srl = str(row.get('srl', '')).strip()
                title = str(row.get('title', '')).strip()
                link = str(row.get('link', '')).strip()
                description = str(row.get('description', row.get('distribtion', ''))).strip()

                if not srl or not title:
                    logger.debug(f"⏭️  跳過空白列 {index + 1}")
                    continue

                child_node_id = f"{file_path.stem}_row_{srl}"

                properties = {
                    'srl': srl,
                    'link': link,
                    'description': description,
                    'source_file': file_path.name,
                    'row_index': index + 1,
                    'dataset_id': dataset_id,
                }

                node_success = kuzu_manager.add_entity(
                    entity_id=child_node_id,
                    name=title,
                    entity_type='Resource',
                    properties=properties,
                    graph_id=graph_id,
                )

                if node_success:
                    success_count += 1
                    logger.debug(f"✅ 列 {index + 1} 子節點創建成功: {title} (ID: {child_node_id})")

                    link_success = kuzu_manager.add_relation(
                        source_id=file_node_id,
                        target_id=child_node_id,
                        relation_type="contains",
                        properties={'row': index + 1},
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
                    exc_info=True,
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
            exc_info=True,
        )


# ================================================================
# Saga 主流程
# ================================================================

def process_file(rag_client: RAGFlowClient, kuzu_manager, dataset_id: str,
                 file_path: Path, dlq, build_inter_node_links_fn=None) -> None:
    """
    處理檔案：上傳至 RAGFlow 並更新知識圖譜（Saga 補償機制）

    Saga 流程：
      Step A: 上傳至 RAGFlow (with retry + exponential backoff)
      Step B: 寫入 KuzuDB 主節點 (失敗時補償 Step A)
      Step C: Excel 深度解析 (可選，失敗不補償)
      Step D: 節點互連 (可選，失敗不補償)

    Args:
        rag_client: RAGFlow 客戶端
        kuzu_manager: KuzuDB 管理器
        dataset_id: RAGFlow 知識庫 ID
        file_path: 檔案路徑
        dlq: DeadLetterQueue 實例
        build_inter_node_links_fn: 節點互連回呼（來自 node_linker 模組）
    """
    saga_steps = {}
    ragflow_doc_id = None
    kuzu_entity_id = None
    try:
        # 讀取圖譜元數據 + 冪等性檢查
        metadata_file = file_path.with_suffix(file_path.suffix + '.meta.json')
        graph_id = None

        if metadata_file.exists():
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    graph_id = metadata.get('graph_id')

                if metadata.get('processed') is True:
                    file_mtime = datetime.fromtimestamp(
                        file_path.stat().st_mtime
                    ).isoformat()
                    last_processed = metadata.get('last_processed_time', '')
                    if last_processed and file_mtime <= last_processed:
                        logger.info(f"⏩ 冪等性跳過 (已處理且未修改): {file_path.name}")
                        return
                    logger.info(
                        f"🔄 檔案已修改，重新處理: {file_path.name} "
                        f"(mtime={file_mtime} > last={last_processed})"
                    )
                else:
                    logger.info(f"📋 讀取圖譜元數據: graph_id={graph_id}")
            except Exception as e:
                logger.warning(f"⚠️  讀取元數據失敗，使用預設圖譜: {e}")

        if not graph_id:
            logger.error(f"❌ 無法確定目標圖譜 ID，跳過處理: {file_path.name}")
            return

        # ── Step A: 上傳至 RAGFlow (with retry) ──
        logger.info(f"📤 正在上傳檔案至 RAGFlow: {file_path.name}")
        upload_result = None

        for attempt in range(MAX_RETRY_ATTEMPTS):
            try:
                upload_result = rag_client.upload_file(
                    dataset_id=dataset_id,
                    file_path=str(file_path),
                )
                ragflow_doc_id = extract_ragflow_doc_id(upload_result)
                saga_steps["ragflow_upload"] = {
                    "status": "COMPLETED",
                    "doc_id": ragflow_doc_id,
                    "attempt": attempt + 1,
                }
                logger.info(f"✅ RAGFlow 上傳成功 (attempt {attempt + 1}): {file_path.name}")
                break
            except Exception as upload_err:
                if attempt < MAX_RETRY_ATTEMPTS - 1:
                    backoff = RETRY_BACKOFF_BASE ** attempt
                    logger.warning(
                        f"⚠️  RAGFlow 上傳重試 {attempt + 1}/{MAX_RETRY_ATTEMPTS} "
                        f"(backoff {backoff}s): {upload_err}"
                    )
                    time.sleep(backoff)
                else:
                    saga_steps["ragflow_upload"] = {
                        "status": "FAILED",
                        "error": str(upload_err),
                        "attempts": MAX_RETRY_ATTEMPTS,
                    }
                    logger.error(f"❌ RAGFlow 上傳最終失敗: {file_path.name} - {upload_err}")
                    dlq.record(file_path, "ragflow_upload", str(upload_err),
                               graph_id=graph_id, saga_steps=saga_steps)
                    return

        logger.debug(f"上傳回應: {upload_result}")

        # ── Step B: 寫入知識圖譜 ──
        kuzu_entity_id = add_to_graph(kuzu_manager, file_path, upload_result, graph_id, dataset_id)

        if kuzu_entity_id:
            saga_steps["kuzu_write"] = {"status": "COMPLETED", "entity_id": kuzu_entity_id}
        else:
            saga_steps["kuzu_write"] = {"status": "FAILED"}
            # 補償 Step A
            if ragflow_doc_id:
                try:
                    rag_client.delete_document(dataset_id=dataset_id, document_id=ragflow_doc_id)
                    logger.info(f"🔄 補償完成: 已撤銷 RAGFlow 上傳 {ragflow_doc_id}")
                    saga_steps["compensation_ragflow_delete"] = {"status": "COMPLETED"}
                except Exception as comp_err:
                    logger.error(f"❌ 補償失敗 (刪除 RAGFlow 文件): {comp_err}")
                    saga_steps["compensation_ragflow_delete"] = {
                        "status": "FAILED", "error": str(comp_err)
                    }
                    dlq.record(file_path, "compensation_ragflow_delete",
                               str(comp_err), ragflow_doc_id=ragflow_doc_id,
                               graph_id=graph_id, saga_steps=saga_steps)
            else:
                logger.warning("ragflow_doc_id 為空，跳過 RAGFlow 補償")
            return

        # ── Step C: Excel 深度解析 ──
        if file_path.suffix.lower() == '.xlsx' and kuzu_entity_id:
            try:
                parse_excel_and_link(kuzu_manager, file_path, kuzu_entity_id, graph_id, dataset_id)
                saga_steps["excel_parse"] = {"status": "COMPLETED"}
            except Exception as excel_err:
                saga_steps["excel_parse"] = {"status": "FAILED", "error": str(excel_err)}
                logger.error(f"⚠️  Excel 解析失敗 (不影響主流程): {excel_err}", exc_info=True)

        # ── Step D: 節點互連 ──
        if kuzu_entity_id and build_inter_node_links_fn:
            try:
                inter_links = build_inter_node_links_fn(kuzu_manager, file_path, kuzu_entity_id, graph_id)
                saga_steps["inter_node_links"] = {"status": "COMPLETED", "links_created": inter_links}
            except Exception as link_err:
                saga_steps["inter_node_links"] = {"status": "FAILED", "error": str(link_err)}
                logger.error(f"⚠️  節點互連失敗 (不影響主流程): {link_err}", exc_info=True)

        # ── 寫入冪等性元數據 ──
        try:
            meta_payload = {
                "graph_id": graph_id,
                "processed": True,
                "last_processed_time": datetime.now().isoformat(),
                "ragflow_id": ragflow_doc_id,
            }
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(meta_payload, f, ensure_ascii=False, indent=2)
            logger.info(f"💾 已寫入冪等性標記: {metadata_file.name}")
        except Exception as meta_err:
            logger.warning(f"⚠️  寫入元數據失敗 (不影響主流程): {meta_err}")

        logger.info(f"✅ Saga 完成: {file_path.name} | steps={list(saga_steps.keys())}")

    except FileNotFoundError as e:
        logger.error(f"❌ 檔案不存在: {file_path} - {e}")
    except Exception as e:
        logger.error(
            f"❌ Saga 失敗: {file_path.name} - {type(e).__name__}: {e}",
            exc_info=True,
        )
        dlq.record(file_path, "saga_exception", str(e),
                    ragflow_doc_id=ragflow_doc_id,
                    kuzu_entity_id=kuzu_entity_id,
                    saga_steps=saga_steps)
