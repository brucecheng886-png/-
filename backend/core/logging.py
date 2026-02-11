"""
結構化日誌 + Request ID 追蹤

功能：
1. StructuredLogFormatter — JSON 面向機器 / 可被 Loki/ELK 解析
2. RequestTracingMiddleware — 為每個 HTTP 請求注入 X-Request-ID
3. request_id ContextVar — 跨 async 保持追蹤 ID 傳播
"""
import uuid
import json
import time
import logging
from contextvars import ContextVar
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# ── 每個請求的唯一追蹤 ID (跨 async 安全) ──
request_id_var: ContextVar[str] = ContextVar('request_id', default='-')


class StructuredLogFormatter(logging.Formatter):
    """
    JSON 結構化日誌格式器

    輸出範例：
    {
      "timestamp": "2026-02-10T12:34:56",
      "level": "INFO",
      "logger": "backend.api.dify",
      "message": "Dify 對話完成",
      "request_id": "a1b2c3d4",
      "module": "dify",
      "line": 42,
      "exception": null
    }
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_var.get('-'),
            "module": record.module,
            "func": record.funcName,
            "line": record.lineno,
        }

        # 附加 exception traceback
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        # 附加 extra 欄位 (如 duration_ms, status_code 等)
        for key in ('duration_ms', 'status_code', 'method', 'path', 'client_ip'):
            if hasattr(record, key):
                log_entry[key] = getattr(record, key)

        return json.dumps(log_entry, ensure_ascii=False, default=str)


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """
    為每個 HTTP 請求注入 Correlation ID (X-Request-ID)

    行為：
    - 客戶端帶 X-Request-ID header → 沿用
    - 客戶端未帶 → 自動生成 8 位短 ID
    - 在回應 header 中回傳 X-Request-ID
    - 記錄請求摘要日誌 (method, path, status, duration)
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 從 Header 取得或生成 Request ID
        req_id = request.headers.get("X-Request-ID")
        if not req_id:
            req_id = uuid.uuid4().hex[:8]

        # 設定到 ContextVar — 後續所有 logger 自動附帶
        token = request_id_var.set(req_id)

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            raise
        finally:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            # 請求摘要日誌
            logger = logging.getLogger("bruv.access")
            logger.info(
                f"{request.method} {request.url.path} → {response.status_code if 'response' in dir() else 500} "
                f"({duration_ms}ms) [req_id={req_id}]",
                extra={
                    "method": request.method,
                    "path": str(request.url.path),
                    "status_code": response.status_code if 'response' in dir() else 500,
                    "duration_ms": duration_ms,
                    "client_ip": request.client.host if request.client else "-",
                }
            )

            # 在回應 header 附上 Request ID
            if 'response' in dir():
                response.headers["X-Request-ID"] = req_id

            # 還原 ContextVar token
            request_id_var.reset(token)

        return response


def setup_structured_logging(level: str = "INFO", json_format: bool = True):
    """
    配置全域結構化日誌

    Args:
        level: 日誌等級 (DEBUG, INFO, WARNING, ERROR)
        json_format: True=JSON格式 (生產), False=人類可讀 (開發)
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # 移除預設 handler
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # 建立 StreamHandler
    handler = logging.StreamHandler()

    if json_format:
        handler.setFormatter(StructuredLogFormatter())
    else:
        # 開發模式：人類可讀格式，但附加 request_id
        handler.setFormatter(logging.Formatter(
            '%(asctime)s [%(levelname)s] [req:%(request_id)s] %(name)s - %(message)s',
            defaults={"request_id": "-"}
        ))

    root_logger.addHandler(handler)

    # 減少第三方庫日誌噪音
    for noisy_logger in ('uvicorn.access', 'watchdog', 'httpcore', 'httpx'):
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)
