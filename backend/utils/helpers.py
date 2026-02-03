"""
工具函式
"""
import hashlib
import json
from datetime import datetime
from typing import Any, Dict


def generate_id(content: str) -> str:
    """生成唯一 ID"""
    return hashlib.md5(content.encode()).hexdigest()


def timestamp_now() -> str:
    """獲取當前時間戳"""
    return datetime.now().isoformat()


def safe_json_loads(data: str, default: Any = None) -> Any:
    """安全的 JSON 解析"""
    try:
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        return default


def format_response(success: bool, data: Any = None, message: str = "") -> Dict:
    """格式化 API 響應"""
    return {
        "success": success,
        "data": data,
        "message": message,
        "timestamp": timestamp_now()
    }
