"""
斷路器 (Circuit Breaker) 模式

防止級聯故障 — 當下游服務 (Dify / RAGFlow) 不健康時，
快速返回錯誤而不是讓請求堆積等待超時。

狀態機：
  CLOSED (正常) ─→ 連續 N 次失敗 ─→ OPEN (拒絕所有請求，返回 503)
  OPEN ─→ recovery_timeout 秒後 ─→ HALF_OPEN (放行 1 個探測請求)
  HALF_OPEN ─→ 成功 ─→ CLOSED | 失敗 ─→ OPEN

使用方式：
    dify_breaker = CircuitBreaker(name="dify", failure_threshold=5, recovery_timeout=30)

    @dify_breaker
    async def call_dify(...):
        ...

    # 或手動使用
    async with dify_breaker:
        response = await httpx_client.post(...)
"""
import asyncio
import logging
import time
from enum import Enum
from typing import Optional, Callable, Any
from functools import wraps

logger = logging.getLogger(__name__)


class CircuitState(str, Enum):
    CLOSED = "closed"          # 正常運作
    OPEN = "open"              # 斷路 — 快速失敗
    HALF_OPEN = "half_open"    # 半開 — 探測是否恢復


class CircuitBreakerOpenError(Exception):
    """斷路器打開時拋出的錯誤"""
    def __init__(self, breaker_name: str, remaining_seconds: float):
        self.breaker_name = breaker_name
        self.remaining_seconds = remaining_seconds
        super().__init__(
            f"CircuitBreaker '{breaker_name}' is OPEN. "
            f"Service unavailable. Retry after {remaining_seconds:.0f}s"
        )


class CircuitBreaker:
    """
    斷路器實作

    Args:
        name: 斷路器名稱 (e.g., "dify", "ragflow")
        failure_threshold: 連續失敗次數閾值，超過則斷路 (預設 5)
        recovery_timeout: OPEN 狀態持續秒數，之後進入 HALF_OPEN (預設 30)
        success_threshold: HALF_OPEN 狀態連續成功次數閾值，達到則恢復 CLOSED (預設 2)
        excluded_exceptions: 不計入失敗次數的例外類型 (e.g., 400 Bad Request)
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        success_threshold: int = 2,
        excluded_exceptions: tuple = (),
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.excluded_exceptions = excluded_exceptions

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: Optional[float] = None
        self._lock = asyncio.Lock()

        logger.info(
            f"⚡ CircuitBreaker '{name}' 初始化 "
            f"(threshold={failure_threshold}, timeout={recovery_timeout}s)"
        )

    @property
    def state(self) -> CircuitState:
        """取得當前狀態 (含自動 OPEN → HALF_OPEN 轉換)"""
        if self._state == CircuitState.OPEN:
            if self._last_failure_time and \
               (time.monotonic() - self._last_failure_time) >= self.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                self._success_count = 0
                logger.info(f"🔄 CircuitBreaker '{self.name}': OPEN → HALF_OPEN")
        return self._state

    def _record_success(self):
        """記錄成功呼叫"""
        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self.success_threshold:
                self._state = CircuitState.CLOSED
                self._failure_count = 0
                self._success_count = 0
                logger.info(f"✅ CircuitBreaker '{self.name}': HALF_OPEN → CLOSED (服務恢復)")
        else:
            # CLOSED 狀態：重置失敗計數
            self._failure_count = 0

    def _record_failure(self):
        """記錄失敗呼叫"""
        self._failure_count += 1
        self._last_failure_time = time.monotonic()

        if self._state == CircuitState.HALF_OPEN:
            # HALF_OPEN 狀態失敗 → 立即回到 OPEN
            self._state = CircuitState.OPEN
            self._success_count = 0
            logger.warning(f"🔴 CircuitBreaker '{self.name}': HALF_OPEN → OPEN (探測失敗)")

        elif self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN
            logger.warning(
                f"🔴 CircuitBreaker '{self.name}': CLOSED → OPEN "
                f"(連續 {self._failure_count} 次失敗，斷路 {self.recovery_timeout}s)"
            )

    def get_status(self) -> dict:
        """取得斷路器狀態資訊"""
        remaining = 0.0
        if self._state == CircuitState.OPEN and self._last_failure_time:
            elapsed = time.monotonic() - self._last_failure_time
            remaining = max(0, self.recovery_timeout - elapsed)

        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "failure_threshold": self.failure_threshold,
            "recovery_timeout": self.recovery_timeout,
            "remaining_seconds": round(remaining, 1),
        }

    # ---------- async context manager ----------

    async def __aenter__(self):
        async with self._lock:
            current_state = self.state

            if current_state == CircuitState.OPEN:
                remaining = self.recovery_timeout - (
                    time.monotonic() - (self._last_failure_time or 0)
                )
                raise CircuitBreakerOpenError(self.name, max(0, remaining))

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        async with self._lock:
            if exc_type is None:
                self._record_success()
            elif exc_type and not issubclass(exc_type, self.excluded_exceptions):
                self._record_failure()
            # excluded exceptions 不計入失敗

        return False  # 不吞掉例外

    # ---------- decorator ----------

    def __call__(self, func: Callable) -> Callable:
        """作為裝飾器使用"""
        @wraps(func)
        async def wrapper(*args, **kwargs):
            async with self:
                return await func(*args, **kwargs)
        return wrapper


# ==================== 預建斷路器實例 ====================

# Dify LLM 服務斷路器
dify_breaker = CircuitBreaker(
    name="dify",
    failure_threshold=5,
    recovery_timeout=30.0,
    success_threshold=2,
)

# RAGFlow 檢索服務斷路器
ragflow_breaker = CircuitBreaker(
    name="ragflow",
    failure_threshold=5,
    recovery_timeout=30.0,
    success_threshold=2,
)
