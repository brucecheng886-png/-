"""
匯入引擎 — Excel/CSV 智能解析核心邏輯

從 graph_import.py 拆分，包含：
- 可調參數 & 常數
- Token 估算 & 自適應批次大小
- 欄位智能提取（免 LLM）
- LLM 結果快取
- JSON 解析 & 節點驗證
- LLM 呼叫（批次 / 重試 / 單筆）
- Checkpoint 斷點續傳
- _run_import 主管線
- 任務追蹤與清理
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import logging
import asyncio
import random
import time
import hashlib
from datetime import datetime
from pathlib import Path

from .import_prompts import (
    build_batch_prompt,
    build_batch_prompt_fast,
)

logger = logging.getLogger(__name__)

# ===== 可調參數 =====
MAX_CONCURRENCY = 2
LLM_TIMEOUT = 300
MAX_RETRIES = 3
RETRY_BASE_DELAY = 3
BATCH_DELAY = 1.0
MAX_TEXT_LEN = 500
FAST_MODE_THRESHOLD = 100
TARGET_BATCH_TOKENS = 2000
TARGET_BATCH_TOKENS_FAST = 6000

# ===== Checkpoint 路徑 =====
CHECKPOINT_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "import_checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

# ===== 全域任務追蹤器 =====
_import_tasks: Dict[str, Dict[str, Any]] = {}
_TASK_EXPIRY_SECONDS = 7200
MAX_RAGFLOW_FILE_BYTES = 200_000


# ------------------------------------------------------------------ #
#  任務清理
# ------------------------------------------------------------------ #

def _cleanup_expired_tasks():
    """清理已過期的完成任務（釋放記憶體）"""
    now = datetime.now()
    expired = []
    for tid, task in _import_tasks.items():
        if task.get("status") in ("done", "error"):
            finished_str = task.get("finished_at")
            if finished_str:
                try:
                    finished = datetime.fromisoformat(finished_str)
                    if (now - finished).total_seconds() > _TASK_EXPIRY_SECONDS:
                        expired.append(tid)
                except (ValueError, TypeError):
                    pass
    for tid in expired:
        del _import_tasks[tid]
    if expired:
        logger.info(f"🗑️ 已清理 {len(expired)} 個過期任務")


# ------------------------------------------------------------------ #
#  Token 估算 & 批次大小
# ------------------------------------------------------------------ #

def _estimate_tokens(text: str) -> int:
    """粗估 token 數：中文字 ≈ 1 token / 字，英文 ≈ 1 token / 4 字元"""
    if not text:
        return 0
    cn = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    return cn + (len(text) - cn) // 4


def _compute_adaptive_batch_size(row_texts: List[str]) -> int:
    """根據平均文字長度自適應調整 BATCH_SIZE"""
    if not row_texts:
        return 10
    sample = row_texts[:50]
    avg_tokens = sum(_estimate_tokens(t[:MAX_TEXT_LEN]) for t in sample) / len(sample)
    return max(5, min(50, int(TARGET_BATCH_TOKENS / max(avg_tokens, 10))))


def _truncate_text(text: str, max_len: int = MAX_TEXT_LEN) -> str:
    """截斷文字至指定長度（附省略號）"""
    if len(text) <= max_len:
        return text
    return text[:max_len] + "..."


# ------------------------------------------------------------------ #
#  欄位智能提取（免 LLM）
# ------------------------------------------------------------------ #

_COLUMN_ALIASES = {
    'label': {'標題', '名稱', 'title', 'name', '主題', 'subject', '項目', '名字', '姓名'},
    'type': {'類型', 'type', '分類', 'category', '類別', 'class', '種類'},
    'description': {'描述', 'description', '內容', 'content', '說明', '摘要',
                     'summary', '備註', 'note', 'notes', 'abstract'},
    'keywords': {'關鍵詞', 'keywords', '關鍵字'},
    'tags': {'標籤', 'tags', '標記', 'tag', '分類標籤'},
}


def _try_extract_from_columns(df: pd.DataFrame) -> List[Optional[Dict]]:
    """
    嘗試從 Excel 欄位名稱直接提取節點資料（免 LLM）。
    至少需要匹配到 label 欄位才啟用。
    """
    import re as _re

    col_strip = {col: col.strip().lower() for col in df.columns}
    field_map: Dict[str, str] = {}

    for field, aliases in _COLUMN_ALIASES.items():
        for col, lower in col_strip.items():
            if lower in aliases:
                field_map[field] = col
                break

    if 'label' not in field_map:
        return [None] * len(df)

    logger.info(f"📋 欄位智能匹配: {', '.join(f'{k}→{v}' for k, v in field_map.items())}")

    results: List[Optional[Dict]] = []
    for _, row in df.iterrows():
        label_val = row.get(field_map['label'], '')
        if pd.isna(label_val) or not str(label_val).strip():
            results.append(None)
            continue

        node: Dict[str, Any] = {
            'label': str(label_val).strip()[:50],
            'description': '',
            'type': '未分類',
            'keywords': [],
            'tags': [],
            'suggested_links': [],
        }

        if 'type' in field_map:
            t = row.get(field_map['type'], '')
            if pd.notna(t) and str(t).strip():
                node['type'] = str(t).strip()[:20]

        if 'description' in field_map:
            d = row.get(field_map['description'], '')
            if pd.notna(d) and str(d).strip():
                node['description'] = str(d).strip()[:500]

        if 'keywords' in field_map:
            kw = row.get(field_map['keywords'], '')
            if pd.notna(kw) and str(kw).strip():
                node['keywords'] = [
                    k.strip() for k in _re.split(r'[,;，；、\s]+', str(kw).strip()) if k.strip()
                ][:5]

        if 'tags' in field_map:
            tg = row.get(field_map['tags'], '')
            if pd.notna(tg) and str(tg).strip():
                node['tags'] = [
                    t.strip() for t in _re.split(r'[,;，；、\s]+', str(tg).strip()) if t.strip()
                ][:5]

        results.append(node)

    return results


# ------------------------------------------------------------------ #
#  LLM 結果快取
# ------------------------------------------------------------------ #

_llm_result_cache: Dict[str, Dict] = {}
_LLM_CACHE_MAX = 10000


def _get_cache_key(text: str) -> str:
    return hashlib.md5(text.strip().encode('utf-8')).hexdigest()


def _cache_llm_result(text: str, result: Dict):
    if len(_llm_result_cache) >= _LLM_CACHE_MAX:
        keys = list(_llm_result_cache.keys())
        for k in keys[:len(keys) // 2]:
            del _llm_result_cache[k]
    _llm_result_cache[_get_cache_key(text)] = result


# ------------------------------------------------------------------ #
#  JSON 解析 & 節點驗證
# ------------------------------------------------------------------ #

def _extract_json(text: str):
    """從 LLM 回應中提取 JSON（支援陣列和物件）"""
    import re
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    md = re.search(r'```(?:json)?\s*([\[\{].*?[\]\}])\s*```', text, re.DOTALL)
    if md:
        try:
            return json.loads(md.group(1))
        except json.JSONDecodeError:
            pass

    for open_ch, close_ch in [('[', ']'), ('{', '}')]:
        start = text.find(open_ch)
        end = text.rfind(close_ch)
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                continue

    raise ValueError("無法從 LLM 回應中解析 JSON")


def _validate_node(data: Dict[str, Any]) -> Dict[str, Any]:
    """驗證並清洗單一節點資料"""
    if 'label' not in data:
        for alt in ['title', 'name', '標題', '名稱']:
            if alt in data and data[alt]:
                data['label'] = str(data[alt])[:50]
                break

    required = ['label', 'description', 'type']
    for f in required:
        if f not in data or not data[f]:
            data[f] = "未提供" if f != 'type' else "未分類"

    if len(data.get('description', '')) > 500:
        data['description'] = data['description'][:500] + "..."

    if 'links' in data and 'suggested_links' not in data:
        data['suggested_links'] = data.pop('links')
    data.setdefault('suggested_links', [])
    if len(data['suggested_links']) > 5:
        data['suggested_links'] = data['suggested_links'][:5]

    data.setdefault('keywords', [])

    if 'tag' in data and 'tags' not in data:
        data['tags'] = data.pop('tag')
    if '標籤' in data and 'tags' not in data:
        data['tags'] = data.pop('標籤')
    data.setdefault('tags', [])
    if isinstance(data['tags'], str):
        data['tags'] = [t.strip() for t in data['tags'].replace('，', ',').split(',') if t.strip()]
    if not isinstance(data['tags'], list):
        data['tags'] = []
    data['tags'] = [str(t).strip() for t in data['tags'] if t and str(t).strip()][:5]

    return data


def parse_llm_response(llm_output: str) -> List[Dict[str, Any]]:
    """解析 LLM 回應，統一回傳 List[Dict]"""
    raw = _extract_json(llm_output)
    items = raw if isinstance(raw, list) else [raw]
    return [_validate_node(item) for item in items]


# ------------------------------------------------------------------ #
#  預設回應
# ------------------------------------------------------------------ #

_DEFAULT_NODE = {
    "label": "LLM 分析失敗",
    "description": "自動分析過程發生錯誤，請手動編輯此節點。",
    "type": "未分類",
    "keywords": [],
    "suggested_links": [],
}

_NO_KEY_NODE = {
    "label": "待配置 LLM",
    "description": "Dify API Key 尚未設定，請至系統設定頁面配置後重新匯入。",
    "type": "未分類",
    "keywords": [],
    "suggested_links": [],
}


# ------------------------------------------------------------------ #
#  LLM 呼叫
# ------------------------------------------------------------------ #

async def call_llm_batch(
    rows: List[str],
    existing_node_names: Optional[List[str]] = None,
    fast_mode: bool = False,
) -> List[Dict[str, Any]]:
    """批次呼叫 Dify LLM"""
    from backend.core.config import get_current_api_keys, settings
    import httpx

    api_keys = get_current_api_keys()
    dify_api_key = api_keys.get('DIFY_API_KEY', '')
    dify_api_url = api_keys.get('DIFY_API_URL', settings.DIFY_API_URL)

    if not dify_api_key:
        logger.warning("Dify API Key 未配置，使用預設回應")
        return [dict(_NO_KEY_NODE) for _ in rows]

    if fast_mode:
        prompt = build_batch_prompt_fast(rows)
    else:
        prompt = build_batch_prompt(rows, existing_node_names)

    try:
        async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
            resp = await client.post(
                f"{dify_api_url}/chat-messages",
                headers={
                    "Authorization": f"Bearer {dify_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "query": prompt,
                    "user": "graph-import-system",
                    "inputs": {},
                    "response_mode": "blocking",
                },
            )
            resp.raise_for_status()
            answer = resp.json().get("answer", "")

        if not answer:
            raise ValueError("Dify 回應為空")

        logger.info(f"Dify LLM 回應（前 300 字）: {answer[:300]}")
        results = parse_llm_response(answer)

        valid_labels = sum(1 for r in results if r.get("label") not in ("未提供", None, ""))
        logger.info(f"📊 批次解析結果: {len(results)} 個節點, {valid_labels} 個有效 label")

        while len(results) < len(rows):
            results.append(dict(_DEFAULT_NODE))

        return results[:len(rows)]

    except Exception as e:
        if hasattr(e, 'response'):
            logger.error(f"Dify API HTTP 錯誤: {e}")
        else:
            logger.error(f"LLM 批次分析失敗: {e}")

    return [dict(_DEFAULT_NODE) for _ in rows]


async def call_llm_batch_with_retry(
    rows: List[str],
    existing_node_names: Optional[List[str]] = None,
    max_retries: int = MAX_RETRIES,
    fast_mode: bool = False,
) -> List[Dict[str, Any]]:
    """帶指數退避重試的批次 LLM 呼叫"""
    for attempt in range(max_retries):
        try:
            result = await call_llm_batch(rows, existing_node_names, fast_mode=fast_mode)

            all_failed = all(
                r.get("label") == _DEFAULT_NODE["label"] for r in result
            )
            if all_failed and len(rows) > 0:
                raise ValueError("全部回傳預設失敗節點，視為失敗")

            return result

        except Exception as e:
            if attempt < max_retries - 1:
                delay = RETRY_BASE_DELAY * (2 ** attempt) + random.uniform(0, 1)
                logger.warning(
                    f"⚠️ 批次 LLM 失敗 (第 {attempt + 1}/{max_retries} 次)，"
                    f"{delay:.1f}s 後重試: {e}"
                )
                await asyncio.sleep(delay)
            else:
                logger.error(f"❌ 批次 LLM 重試 {max_retries} 次仍失敗: {e}")
                return [dict(_DEFAULT_NODE) for _ in rows]

    return [dict(_DEFAULT_NODE) for _ in rows]


async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """向下相容：單筆 LLM 分析"""
    results = await call_llm_batch_with_retry([prompt])
    return results[0]


# ------------------------------------------------------------------ #
#  Checkpoint 管理
# ------------------------------------------------------------------ #

def _save_checkpoint(task_id: str, completed_batches: set, partial_nodes: List[Dict]):
    checkpoint_file = CHECKPOINT_DIR / f"{task_id}.json"
    try:
        checkpoint_file.write_text(json.dumps({
            "task_id": task_id,
            "completed_batches": sorted(completed_batches),
            "partial_nodes_count": len(partial_nodes),
            "last_update": datetime.now().isoformat(),
        }, ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        logger.warning(f"Checkpoint 儲存失敗: {e}")


def _load_checkpoint(task_id: str) -> set:
    checkpoint_file = CHECKPOINT_DIR / f"{task_id}.json"
    if checkpoint_file.exists():
        try:
            data = json.loads(checkpoint_file.read_text(encoding="utf-8"))
            return set(data.get("completed_batches", []))
        except Exception as e:
            logger.warning(f"Checkpoint 讀取失敗: {e}")
    return set()


def _cleanup_checkpoint(task_id: str):
    checkpoint_file = CHECKPOINT_DIR / f"{task_id}.json"
    try:
        if checkpoint_file.exists():
            checkpoint_file.unlink()
    except Exception as e:
        logger.warning(f"Checkpoint 清理失敗: {e}")


# ------------------------------------------------------------------ #
#  背景匯入主管線
# ------------------------------------------------------------------ #

async def _run_import(
    task_id: str,
    row_texts: List[str],
    row_names: List[str],
    df: pd.DataFrame,
    existing_names: Optional[List[str]] = None,
    graph_id: Optional[str] = None,
    ragflow_dataset_id: Optional[str] = None,
    kuzu_manager=None,
    http_client=None,
):
    """
    背景執行 Excel 匯入 — 分批呼叫 LLM + 逐批更新進度

    策略:
    1. 欄位智能提取: 匹配已知欄位名免 LLM
    2. LLM 結果快取: 相同內容跨批次去重
    3. 自適應大批次: Fast mode 加大每批筆數
    4. Semaphore 併發控制 + 斷點續傳 + 指數退避重試
    """
    task = _import_tasks[task_id]
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

    try:
        total_rows = len(row_texts)

        # ==== 策略 1: 欄位智能提取 (免 LLM) ====
        pre_extracted = _try_extract_from_columns(df)
        extracted_count = sum(1 for p in pre_extracted if p is not None)
        llm_indices = [i for i in range(total_rows) if pre_extracted[i] is None]
        llm_row_count = len(llm_indices)

        if extracted_count > 0:
            logger.info(
                f"📋 欄位智能提取: {extracted_count}/{total_rows} 行免 LLM，"
                f"僅 {llm_row_count} 行需要 LLM 分析"
            )
            task["extracted_count"] = extracted_count

        truncated_texts = [_truncate_text(t, MAX_TEXT_LEN) for t in row_texts]

        fast_mode = total_rows > FAST_MODE_THRESHOLD
        mode_label = "⚡ Fast" if fast_mode else "📝 Full"

        # ==== 策略 3: 自適應批次大小 ====
        if llm_row_count > 0:
            llm_sample = [row_texts[i] for i in llm_indices[:50]]
            avg_tokens = sum(_estimate_tokens(t[:MAX_TEXT_LEN]) for t in llm_sample) / len(llm_sample)
            target_tokens = TARGET_BATCH_TOKENS_FAST if fast_mode else TARGET_BATCH_TOKENS
            batch_size = max(5, min(50, int(target_tokens / max(avg_tokens, 10))))
        else:
            batch_size = 10

        batches: List[List[int]] = []
        for i in range(0, llm_row_count, batch_size):
            batches.append(llm_indices[i:min(i + batch_size, llm_row_count)])

        total_batches = len(batches)
        logger.info(
            f"📦 任務 {task_id[:8]}... {mode_label} 模式: {total_rows} 行 "
            f"({extracted_count} 免 LLM + {llm_row_count} 行 LLM) → "
            f"{total_batches} 批 (batch_size={batch_size}, concurrency={MAX_CONCURRENCY})"
        )

        task["batch_size"] = batch_size
        task["total_batches"] = total_batches
        task["completed_batches"] = 0
        task["fast_mode"] = fast_mode
        task["eta_seconds"] = None
        task["rows_per_sec"] = 0

        initial_completed = extracted_count
        task["completed"] = initial_completed
        if total_rows > 0:
            task["progress_pct"] = round(initial_completed / total_rows * 100, 1)

        completed_batches = _load_checkpoint(task_id)
        if completed_batches:
            logger.info(f"🔄 從 checkpoint 恢復: 已完成 {len(completed_batches)} 批")

        llm_results: List[Optional[List[Dict]]] = [None] * total_batches

        batch_times: List[float] = []
        task_start_time = time.monotonic()

        async def process_batch(batch_idx: int, indices: List[int]):
            async with semaphore:
                if batch_idx in completed_batches:
                    logger.info(f"⏭️ 批次 {batch_idx + 1}/{total_batches} 已完成，跳過")
                    return

                if batch_idx > 0:
                    await asyncio.sleep(BATCH_DELAY)

                texts = [truncated_texts[i] for i in indices]
                batch_start = time.monotonic()

                if fast_mode:
                    cached_results: Dict[int, Dict] = {}
                    uncached_pairs: List[tuple] = []

                    for local_i, text in enumerate(texts):
                        cache_key = _get_cache_key(text)
                        cached = _llm_result_cache.get(cache_key)
                        if cached is not None:
                            cached_results[local_i] = cached
                        else:
                            uncached_pairs.append((local_i, text))

                    cache_hits = len(cached_results)

                    if uncached_pairs:
                        uncached_texts = [t for _, t in uncached_pairs]
                        llm_response = await call_llm_batch_with_retry(
                            uncached_texts, existing_names, fast_mode=True
                        )
                        for ui, (local_i, text) in enumerate(uncached_pairs):
                            if ui < len(llm_response):
                                _cache_llm_result(text, llm_response[ui])
                    else:
                        llm_response = []

                    result: List[Dict] = [dict(_DEFAULT_NODE)] * len(texts)
                    for local_i, cached in cached_results.items():
                        result[local_i] = cached
                    for ui, (local_i, _) in enumerate(uncached_pairs):
                        if ui < len(llm_response):
                            result[local_i] = llm_response[ui]
                    for i in range(len(result)):
                        if result[i] is _DEFAULT_NODE or result[i].get("label") is None:
                            result[i] = dict(_DEFAULT_NODE)

                    llm_results[batch_idx] = result
                else:
                    result = await call_llm_batch_with_retry(
                        texts, existing_names, fast_mode=False
                    )
                    llm_results[batch_idx] = result
                    cache_hits = 0

                batch_elapsed = time.monotonic() - batch_start
                batch_times.append(batch_elapsed)

                completed_batches.add(batch_idx)
                completed_count = initial_completed + sum(
                    len(batches[bi]) for bi in completed_batches
                )
                task["completed"] = completed_count
                task["progress_pct"] = round(
                    completed_count / task["total"] * 100, 1
                )
                task["completed_batches"] = len(completed_batches)

                if batch_times:
                    avg_batch_time = sum(batch_times) / len(batch_times)
                    remaining_batches = total_batches - len(completed_batches)
                    remaining_rounds = max(1, remaining_batches / MAX_CONCURRENCY)
                    eta = avg_batch_time * remaining_rounds
                    task["eta_seconds"] = round(eta, 1)

                    elapsed = time.monotonic() - task_start_time
                    task["rows_per_sec"] = round(
                        completed_count / max(elapsed, 0.1), 1
                    )

                _save_checkpoint(task_id, completed_batches, [])

                cache_info = f", {cache_hits} 快取命中" if cache_hits else ""
                logger.info(
                    f"✅ 批次 {batch_idx + 1}/{total_batches} 完成 "
                    f"({batch_elapsed:.1f}s, 進度: {task['progress_pct']}%, "
                    f"ETA: {task.get('eta_seconds', '?')}s{cache_info})"
                )

        # ---- 並行執行批次 ----
        if batches:
            tasks = [process_batch(bi, idxs) for bi, idxs in enumerate(batches)]
            await asyncio.gather(*tasks)

        # ---- 組裝節點 ----
        row_results: List[Optional[Dict]] = list(pre_extracted)

        for batch_idx, indices in enumerate(batches):
            batch_results = llm_results[batch_idx] or []
            for local_i, global_i in enumerate(indices):
                if local_i < len(batch_results):
                    row_results[global_i] = batch_results[local_i]

        for i in range(total_rows):
            if row_results[i] is None:
                row_results[i] = dict(_DEFAULT_NODE)

        nodes: List[Dict[str, Any]] = []
        ts = datetime.now().timestamp()

        for global_i in range(total_rows):
            llm = row_results[global_i] or dict(_DEFAULT_NODE)
            node = {
                "id": f"node_{ts}_{global_i}",
                "name": row_names[global_i],
                "label": llm.get("label", "未命名"),
                "description": llm.get("description", ""),
                "type": llm.get("type", "未分類"),
                "group": 1,
                "size": 20,
                "keywords": llm.get("keywords", []),
                "tags": llm.get("tags", []),
                "suggested_links": llm.get("suggested_links", []),
                "raw_data": {
                    k: (None if pd.isna(v) else v)
                    for k, v in df.iloc[global_i].to_dict().items()
                },
            }
            nodes.append(node)

        # ---- suggested_links batch-local → 全域 ----
        for batch_idx, indices in enumerate(batches):
            for local_i, global_i in enumerate(indices):
                node = nodes[global_i]
                resolved_links = []
                for link in node.get("suggested_links", []):
                    target_idx = link.get("target_index")
                    if target_idx is not None and isinstance(target_idx, int):
                        if 0 <= target_idx < len(indices) and target_idx != local_i:
                            target_global = indices[target_idx]
                            if 0 <= target_global < len(nodes):
                                resolved_links.append({
                                    "target_id": nodes[target_global]["id"],
                                    "target_name": nodes[target_global]["name"],
                                    "relation": link.get("relation", "complement"),
                                    "reason": link.get("reason", ""),
                                })
                node["links"] = resolved_links
                if "suggested_links" in node:
                    del node["suggested_links"]

        for node in nodes:
            if "suggested_links" in node:
                node["links"] = []
                del node["suggested_links"]

        failed_count = sum(
            1 for n in nodes if n.get("label") == _DEFAULT_NODE["label"]
        )

        # ---- 寫入 KuzuDB ----
        kuzu_saved = 0
        if kuzu_manager and graph_id:
            logger.info(f"📝 開始寫入 KuzuDB (graph_id={graph_id}, {len(nodes)} 個節點)...")
            for node in nodes:
                try:
                    props = {
                        "description": node.get("description", ""),
                        "keywords": json.dumps(node.get("keywords", []), ensure_ascii=False),
                        "tags": json.dumps(node.get("tags", []), ensure_ascii=False),
                        "raw_data": json.dumps(node.get("raw_data", {}), ensure_ascii=False, default=str),
                        "source": "excel_import",
                        "import_task_id": task_id,
                    }
                    success = kuzu_manager.add_entity(
                        entity_id=node["id"],
                        name=node.get("label", node.get("name", "未命名")),
                        entity_type=node.get("type", "未分類"),
                        properties=props,
                        graph_id=graph_id,
                    )
                    if success:
                        kuzu_saved += 1
                except Exception as e:
                    logger.warning(f"⚠️ KuzuDB 節點寫入失敗 ({node.get('id')}): {e}")
            logger.info(f"✅ KuzuDB 寫入完成: {kuzu_saved}/{len(nodes)} 個節點")

            links_created = 0
            for node in nodes:
                for link in node.get("links", []):
                    try:
                        target_id = link.get("target_id")
                        if target_id:
                            kuzu_manager.add_relation(
                                from_id=node["id"],
                                to_id=target_id,
                                relation_type=link.get("relation", "complement"),
                                properties={"reason": link.get("reason", "")}
                            )
                            links_created += 1
                    except Exception:
                        pass
            if links_created:
                logger.info(f"🔗 已建立 {links_created} 條連線")

        # ---- 合併上傳 RAGFlow ----
        ragflow_uploaded = 0
        if ragflow_dataset_id:
            try:
                from backend.rag_client import RAGFlowClient
                from backend.core.config import get_current_api_keys, settings
                import tempfile
                import httpx

                api_keys = get_current_api_keys()
                if api_keys.get('RAGFLOW_API_KEY'):
                    rag_client = RAGFlowClient(
                        api_key=api_keys['RAGFLOW_API_KEY'],
                        base_url=api_keys['RAGFLOW_API_URL'],
                        http_client=http_client,
                    )
                    ragflow_api_url = api_keys.get('RAGFLOW_API_URL', 'http://localhost:9380/api/v1')

                    logger.info(f"📚 合併 {len(row_texts)} 個節點為單一文件上傳 RAGFlow...")
                    task["ragflow_stage"] = "uploading"

                    from collections import defaultdict
                    type_groups = defaultdict(list)
                    for ri, (row_text, node) in enumerate(zip(row_texts, nodes)):
                        node_type = node.get("type", "未分類")
                        type_groups[node_type].append((ri, row_text, node))

                    temp_dir = Path(tempfile.gettempdir()) / f"ragflow_merged_{task_id[:8]}"
                    temp_dir.mkdir(exist_ok=True)
                    uploaded_doc_ids = []

                    try:
                        for type_name, group_items in type_groups.items():
                            sections = []
                            for ri, row_text, node in group_items:
                                label = node.get("label", f"row_{ri}")
                                desc = node.get("description", "")
                                keywords = ", ".join(node.get("keywords", []))
                                section = f"## {label}\n\n"
                                if desc:
                                    section += f"{desc}\n\n"
                                if keywords:
                                    section += f"**關鍵詞**: {keywords}\n\n"
                                section += f"**原始資料**: {row_text}\n\n---\n"
                                sections.append(section)

                            original_name = task.get("filename", "import").rsplit(".", 1)[0]
                            safe_type = type_name.replace("/", "_").replace("\\", "_")[:20]

                            chunks = []
                            current_chunk = []
                            current_size = 0
                            for sec in sections:
                                sec_bytes = len(sec.encode('utf-8'))
                                if current_size + sec_bytes > MAX_RAGFLOW_FILE_BYTES and current_chunk:
                                    chunks.append(current_chunk)
                                    current_chunk = []
                                    current_size = 0
                                current_chunk.append(sec)
                                current_size += sec_bytes
                            if current_chunk:
                                chunks.append(current_chunk)

                            for chunk_idx, chunk_sections in enumerate(chunks):
                                chunk_count = len(chunk_sections)
                                suffix = f"_part{chunk_idx + 1}" if len(chunks) > 1 else ""
                                merged_filename = f"{original_name}_{safe_type}_{chunk_count}筆{suffix}.md"

                                merged_content = f"# {original_name} — {type_name}"
                                if len(chunks) > 1:
                                    merged_content += f" (Part {chunk_idx + 1}/{len(chunks)})"
                                merged_content += f"\n\n> 共 {chunk_count} 筆資料，來源: Excel 批次匯入\n\n"
                                merged_content += "\n".join(chunk_sections)

                                tmp_file = temp_dir / merged_filename
                                tmp_file.write_text(merged_content, encoding='utf-8')

                                try:
                                    upload_result = await rag_client.async_upload_file(
                                        dataset_id=ragflow_dataset_id,
                                        file_path=str(tmp_file)
                                    )
                                    ragflow_uploaded += chunk_count

                                    docs = upload_result.get('data', [])
                                    if isinstance(docs, list):
                                        for doc in docs:
                                            if isinstance(doc, dict) and doc.get('id'):
                                                uploaded_doc_ids.append(doc['id'])
                                    elif isinstance(docs, dict) and docs.get('id'):
                                        uploaded_doc_ids.append(docs['id'])

                                    logger.info(
                                        f"📄 已上傳: {merged_filename} "
                                        f"({chunk_count} 筆, {len(merged_content)} 字)"
                                    )
                                except Exception as e:
                                    logger.warning(f"⚠️ RAGFlow 合併文件上傳失敗 ({type_name}{suffix}): {e}")

                        if uploaded_doc_ids:
                            try:
                                async with httpx.AsyncClient(timeout=300) as parse_client:
                                    await parse_client.post(
                                        f"{ragflow_api_url}/datasets/{ragflow_dataset_id}/chunks",
                                        headers={
                                            "Authorization": f"Bearer {api_keys['RAGFLOW_API_KEY']}",
                                            "Content-Type": "application/json"
                                        },
                                        json={"document_ids": uploaded_doc_ids}
                                    )
                                logger.info(
                                    f"🔄 已觸發 {len(uploaded_doc_ids)} 個合併文件的解析 "
                                    f"(原 {len(row_texts)} 行 → {len(uploaded_doc_ids)} 個文件)"
                                )
                            except Exception as parse_err:
                                logger.warning(f"⚠️ 觸發解析失敗: {parse_err}")

                        logger.info(
                            f"✅ RAGFlow 合併上傳完成: {len(row_texts)} 行 → "
                            f"{len(uploaded_doc_ids)} 個文件 (按類型分組)"
                        )
                    finally:
                        import shutil
                        shutil.rmtree(temp_dir, ignore_errors=True)
                else:
                    logger.warning("⚠️ RAGFlow API Key 未配置，跳過 RAGFlow 上傳")
            except Exception as e:
                logger.error(f"❌ RAGFlow 逐行上傳失敗: {e}")

        # ---- 釋放記憶體 ----
        node_count = len(nodes)
        node_summaries = [
            {"id": n["id"], "label": n.get("label", ""), "type": n.get("type", "")}
            for n in nodes
        ]
        del nodes

        total_elapsed = time.monotonic() - task_start_time
        task.update({
            "status": "done",
            "completed": len(row_texts),
            "failed": failed_count,
            "progress_pct": 100.0,
            "node_count": node_count,
            "node_summaries": node_summaries,
            "kuzu_saved": kuzu_saved,
            "ragflow_uploaded": ragflow_uploaded,
            "finished_at": datetime.now().isoformat(),
            "eta_seconds": 0,
            "elapsed_seconds": round(total_elapsed, 1),
            "rows_per_sec": round(len(row_texts) / max(total_elapsed, 0.1), 1),
        })

        _cleanup_checkpoint(task_id)

        logger.info(
            f"🎉 任務 {task_id[:8]}... 完成: "
            f"{node_count} 個節點, {kuzu_saved} 寫入 KuzuDB, "
            f"{ragflow_uploaded} 上傳 RAGFlow, {failed_count} 個失敗"
        )

    except Exception as e:
        logger.error(f"❌ 任務 {task_id[:8]}... 失敗: {e}", exc_info=True)
        task.update({
            "status": "error",
            "error": str(e),
            "finished_at": datetime.now().isoformat(),
        })
