"""
LLM Prompt 模板 — 圖譜導入用

從 graph_import.py 拆分，包含：
- 完整模式 / 快速模式的 System Role 與 Node Schema
- build_batch_prompt / build_batch_prompt_fast / build_node_analysis_prompt
"""
from typing import List, Dict, Any, Optional

# ===== 完整模式 Prompt =====

SYSTEM_ROLE = """你是企業級知識圖譜架構師。根據輸入資料，為每筆記錄產生結構化的圖譜節點。

輸出規則：
- 回傳一個 JSON 陣列，每個元素對應一筆輸入
- 不要包含 Markdown 標記或任何額外文字
- 只輸出純 JSON"""

NODE_SCHEMA = """{
  "label": "3-10字精準標題",
  "description": "100-200字描述，含背景、核心內容、應用場景",
  "type": "技術架構|API介面|數據流程|安全規範|業務流程|最佳實踐|問題排查|配置文檔|自訂(2-4字)",
  "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
  "tags": ["分類標籤1", "分類標籤2", "分類標籤3"],
  "suggested_links": [
    {"target_index": 0, "relation": "dependency|causality|sequence|composition|complement|contrast", "reason": "連線原因(30字內)"}
  ]
}

tags 規則：3-5 個分類標籤，用於快速篩選與歸類。標籤應簡短(2-6字)、具體、可複用，例如「後端」「安全性」「資料庫」「API」「DevOps」。"""


# ===== 快速模式 Prompt（大量資料 > FAST_MODE_THRESHOLD 筆啟用） =====

SYSTEM_ROLE_FAST = """你是知識圖譜架構師。快速為每筆記錄歸類。

規則：回傳 JSON 陣列，每元素對應一筆輸入。不要 Markdown，只有純 JSON。"""

NODE_SCHEMA_FAST = """{
  "label": "3-8字標題",
  "description": "30-80字摘要",
  "type": "分類(2-4字)",
  "keywords": ["關鍵詞1", "關鍵詞2"],
  "tags": ["分類標籤1", "分類標籤2"]
}

tags: 2-3 個簡短分類標籤(2-6字)，用於篩選歸類。"""


def build_batch_prompt(
    rows: List[str],
    existing_node_names: Optional[List[str]] = None
) -> str:
    """
    建構批次分析 Prompt — 一次送多筆資料給 LLM

    Args:
        rows: 每筆資料的文字描述 (已格式化為 "col: val | col: val")
        existing_node_names: 現有節點名稱列表 (用於避免重複)
    """
    numbered = "\n".join([f"[{i}] {row}" for i, row in enumerate(rows)])

    existing_ctx = ""
    if existing_node_names:
        names = ", ".join(existing_node_names[:30])
        existing_ctx = f"\n已存在的節點: {names}\n避免建立重複節點，suggested_links 的 target_index 可用 -1 代表連線到已存在的節點。\n"

    return f"""{SYSTEM_ROLE}

節點 Schema:
{NODE_SCHEMA}
{existing_ctx}
以下有 {len(rows)} 筆資料，請輸出 JSON 陣列（長度 = {len(rows)}）：

{numbered}

suggested_links.target_index 指向本批次內其他資料的編號 (0-based)，若無關聯則留空陣列。
輸出純 JSON 陣列，不要任何多餘文字："""


def build_batch_prompt_fast(rows: List[str]) -> str:
    """
    大量模式 Prompt — 省略 suggested_links，精簡 description
    輸出 token 約為完整模式的 1/3，適合 30~50 筆/批
    """
    numbered = "\n".join([f"[{i}] {row}" for i, row in enumerate(rows)])
    return f"""{SYSTEM_ROLE_FAST}

Schema:
{NODE_SCHEMA_FAST}

{len(rows)} 筆資料:
{numbered}

輸出 JSON 陣列 (長度={len(rows)})："""


def build_node_analysis_prompt(
    raw_content: str,
    existing_nodes: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    單筆分析 Prompt（向下相容，當批次為 1 時使用）
    """
    existing_names = None
    if existing_nodes:
        existing_names = [n.get('name', '') for n in existing_nodes if n.get('name')]
    return build_batch_prompt([raw_content], existing_names)
