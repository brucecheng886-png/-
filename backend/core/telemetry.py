"""
OpenTelemetry 分散式追蹤 — 最小化實作

提供跨服務的請求追蹤鏈：
  FastAPI → httpx (Dify/RAGFlow) → 下游服務

設計原則：
1. 最小侵入 — 自動儀器化 (Auto-Instrumentation)，不需修改業務程式碼
2. 可選啟用 — 透過 OTEL_ENABLED 環境變數控制
3. 可插拔匯出 — Console (開發) / OTLP (Jaeger/Tempo, 生產)

配置方式：
  OTEL_ENABLED=true            # 啟用 OpenTelemetry
  OTEL_EXPORTER=console        # console | otlp
  OTEL_OTLP_ENDPOINT=...       # OTLP 匯出目的地 (生產)
  OTEL_SERVICE_NAME=bruv-api   # 服務名稱
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# OpenTelemetry 是可選依賴，不強制安裝
_otel_available = False
try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import (
        SimpleSpanProcessor,
        BatchSpanProcessor,
        ConsoleSpanExporter,
    )
    from opentelemetry.sdk.resources import Resource
    _otel_available = True
except ImportError:
    pass


def setup_opentelemetry(app=None) -> Optional[object]:
    """
    初始化 OpenTelemetry 追蹤

    Args:
        app: FastAPI app 實例 (用於自動儀器化)

    Returns:
        TracerProvider 或 None (未啟用/未安裝)

    環境變數：
        OTEL_ENABLED: true/false (預設 false)
        OTEL_EXPORTER: console/otlp (預設 console)
        OTEL_OTLP_ENDPOINT: OTLP 匯出端點
        OTEL_SERVICE_NAME: 服務名稱 (預設 bruv-api)
    """
    enabled = os.environ.get("OTEL_ENABLED", "false").lower() == "true"

    if not enabled:
        logger.info("OpenTelemetry 未啟用 (設定 OTEL_ENABLED=true 以啟用)")
        return None

    if not _otel_available:
        logger.warning(
            "⚠️ OpenTelemetry 依賴未安裝。請執行:\n"
            "  pip install opentelemetry-api opentelemetry-sdk "
            "opentelemetry-instrumentation-fastapi "
            "opentelemetry-instrumentation-httpx"
        )
        return None

    service_name = os.environ.get("OTEL_SERVICE_NAME", "bruv-api")
    exporter_type = os.environ.get("OTEL_EXPORTER", "console")

    # 建立 Resource (服務後設資料)
    resource = Resource.create({
        "service.name": service_name,
        "service.version": "3.0",
        "deployment.environment": os.environ.get("ENVIRONMENT", "production"),
    })

    # 建立 TracerProvider
    provider = TracerProvider(resource=resource)

    # 配置 Span Exporter
    if exporter_type == "otlp":
        try:
            from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
            otlp_endpoint = os.environ.get("OTEL_OTLP_ENDPOINT", "http://localhost:4317")
            exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            provider.add_span_processor(BatchSpanProcessor(exporter))
            logger.info(f"✅ OpenTelemetry OTLP Exporter → {otlp_endpoint}")
        except ImportError:
            logger.warning("OTLP exporter 未安裝，回退到 Console exporter")
            provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
    else:
        # Console exporter (開發用)
        provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
        logger.info("✅ OpenTelemetry Console Exporter (開發模式)")

    trace.set_tracer_provider(provider)

    # 自動儀器化 FastAPI
    if app:
        try:
            from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
            FastAPIInstrumentor.instrument_app(app)
            logger.info("✅ FastAPI 自動追蹤已啟用")
        except ImportError:
            logger.warning("opentelemetry-instrumentation-fastapi 未安裝")

    # 自動儀器化 httpx (追蹤 Dify/RAGFlow 請求)
    try:
        from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
        HTTPXClientInstrumentor().instrument()
        logger.info("✅ httpx 自動追蹤已啟用 (Dify/RAGFlow 請求)")
    except ImportError:
        logger.warning("opentelemetry-instrumentation-httpx 未安裝")

    logger.info(
        f"🔭 OpenTelemetry 初始化完成 (service={service_name}, exporter={exporter_type})"
    )

    return provider


def get_tracer(name: str = __name__):
    """
    取得 Tracer 實例 — 用於手動建立 Span

    使用方式：
        tracer = get_tracer(__name__)
        with tracer.start_as_current_span("my-operation") as span:
            span.set_attribute("key", "value")
            do_work()
    """
    if _otel_available:
        return trace.get_tracer(name)

    # 回退: 如果 OpenTelemetry 未安裝，返回 NoOp Tracer
    class NoOpSpan:
        def set_attribute(self, *args, **kwargs): pass
        def set_status(self, *args, **kwargs): pass
        def record_exception(self, *args, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass

    class NoOpTracer:
        def start_as_current_span(self, name, **kwargs):
            return NoOpSpan()

    return NoOpTracer()
