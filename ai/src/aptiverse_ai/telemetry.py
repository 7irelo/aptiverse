"""OpenTelemetry setup. Spans follow the GenAI semantic conventions (set in the gateway); trace context
arrives from .NET in `traceparent`, so one trace covers BFF, API, this service and the provider call."""

from __future__ import annotations

from fastapi import FastAPI
from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from aptiverse_ai.settings import TelemetrySettings

_configured = False


def configure(app: FastAPI, settings: TelemetrySettings, environment: str) -> None:
    global _configured
    if not _configured:
        resource = Resource.create({"service.name": settings.service_name, "deployment.environment.name": environment})
        tracer_provider = TracerProvider(resource=resource)
        if settings.otlp_endpoint:
            tracer_provider.add_span_processor(
                BatchSpanProcessor(OTLPSpanExporter(endpoint=f"{settings.otlp_endpoint}/v1/traces"))
            )
            reader = PeriodicExportingMetricReader(
                OTLPMetricExporter(endpoint=f"{settings.otlp_endpoint}/v1/metrics"),
                export_interval_millis=30_000,
            )
            metrics.set_meter_provider(MeterProvider(resource=resource, metric_readers=[reader]))
        trace.set_tracer_provider(tracer_provider)
        HTTPXClientInstrumentor().instrument()
        _configured = True
    FastAPIInstrumentor.instrument_app(app, excluded_urls="health/live,health/ready")
