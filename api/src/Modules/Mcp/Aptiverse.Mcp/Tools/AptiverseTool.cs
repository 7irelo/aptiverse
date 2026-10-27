using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;

namespace Aptiverse.Mcp.Tools;

/// <summary>
/// Base of every Aptiverse MCP tool. The protocol definition is exactly the pinned one, and every call goes through
/// <see cref="ToolRunner"/> (scope, arguments, attempt block, limits, timeout, audit) before <see cref="ExecuteAsync"/>
/// runs; a tool never sees a caller it has not checked. Tools are singletons and resolve their services per call.
/// </summary>
internal abstract class AptiverseTool : McpServerTool
{
    protected AptiverseTool(ToolDefinition definition)
    {
        ArgumentNullException.ThrowIfNull(definition);
        Definition = definition;
        Schema = new ArgumentSchema(definition.InputSchema);
        using var schema = JsonDocument.Parse(definition.InputSchema);
        ProtocolTool = new Tool
        {
            Name = definition.Name,
            Description = definition.Description,
            InputSchema = schema.RootElement.Clone(),
        };
    }

    public ToolDefinition Definition { get; }

    public ArgumentSchema Schema { get; }

    /// <summary>Write tools get their own per-user rate limit.</summary>
    public virtual bool Writes => false;

    public override Tool ProtocolTool { get; }

    public override IReadOnlyList<object> Metadata { get; } = [];

    public override async ValueTask<CallToolResult> InvokeAsync(RequestContext<CallToolRequestParams> request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var services = request.Services ?? throw new InvalidOperationException("The MCP request has no service provider.");
        var arguments = request.Params?.Arguments is { } args
            ? new Dictionary<string, JsonElement>(args, StringComparer.Ordinal)
            : [];
        return await services.GetRequiredService<ToolRunner>()
            .RunAsync(this, request.User ?? new ClaimsPrincipal(), arguments, services, cancellationToken);
    }

    public abstract Task<ToolOutcome> ExecuteAsync(ToolCall call, CancellationToken cancellationToken);
}

/// <summary>A checked call: the student it is for, validated arguments and the services of this request.</summary>
internal sealed record ToolCall(Guid UserId, string TokenId, IReadOnlyDictionary<string, JsonElement> Arguments, IServiceProvider Services)
{
    public string? String(string name) =>
        Arguments.TryGetValue(name, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString()!.Trim() : null;

    public int? Int(string name) =>
        Arguments.TryGetValue(name, out var value) && value.ValueKind == JsonValueKind.Number ? value.GetInt32() : null;

    public IReadOnlyList<string> Strings(string name) =>
        Arguments.TryGetValue(name, out var value) && value.ValueKind == JsonValueKind.Array
            ? value.EnumerateArray().Select(v => v.GetString()!.Trim()).ToList()
            : [];
}

/// <summary>What a tool returns: a payload for the model, or a stable error code with a short explanation.</summary>
internal sealed record ToolOutcome(string Code, object? Payload, string? Message, Guid? ResourceId = null)
{
    public bool Succeeded => Code == ToolOutcomes.Ok;

    public static ToolOutcome Ok(object payload, Guid? resourceId = null) => new(ToolOutcomes.Ok, payload, null, resourceId);

    public static ToolOutcome Fail(string code, string message) => new(code, null, message);
}

/// <summary>Stable outcome codes. They are what the model sees on failure and what the audit row records.</summary>
internal static class ToolOutcomes
{
    public const string Ok = "ok";
    public const string Unauthorized = "unauthorized";
    public const string MissingScope = "missing_scope";
    public const string InvalidArguments = "invalid_arguments";
    public const string BlockedDuringAttempt = "blocked_during_attempt";
    public const string RateLimited = "rate_limited";
    public const string Timeout = "timeout";
    public const string Unavailable = "unavailable";
    public const string Failed = "failed";
    public const string UnknownSubject = "unknown_subject";
    public const string NoUpcomingAssessment = "no_upcoming_assessment";
    public const string DailyLimitReached = "daily_limit_reached";
    public const string GenerationInProgress = "generation_in_progress";
}
