using System.Diagnostics.Metrics;

namespace Aptiverse.Mcp;

/// <summary>Tool call rate, outcome and latency per tool. No user ids: those live only in the audit table.</summary>
internal static class McpMetrics
{
    private static readonly Meter Meter = new("Aptiverse.Mcp");
    private static readonly Counter<long> Calls = Meter.CreateCounter<long>("aptiverse.mcp.tool_calls", description: "MCP tool calls by tool and outcome");
    private static readonly Histogram<double> Latency = Meter.CreateHistogram<double>("aptiverse.mcp.tool_latency", unit: "ms", description: "MCP tool call latency");

    public static void ToolCalled(string tool, string outcome, TimeSpan latency)
    {
        var tags = new KeyValuePair<string, object?>[] { new("tool", tool), new("outcome", outcome) };
        Calls.Add(1, tags);
        Latency.Record(latency.TotalMilliseconds, tags);
    }
}
