namespace Aptiverse.SharedKernel.Hosting;

/// <summary>
/// OTLP export is driven by the standard OTEL_EXPORTER_OTLP_* environment variables.
/// This section only toggles the local console exporter.
/// </summary>
public sealed class TelemetryOptions
{
    public const string SectionName = "Telemetry";

    public bool ConsoleExporter { get; set; }
}
