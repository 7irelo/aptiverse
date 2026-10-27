using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Mcp.Domain;

/// <summary>
/// One MCP tool call, written whatever the outcome. Holds ids, the tool, the scope it needs, the outcome and the
/// latency; never the arguments or the result, which can carry the student's own words.
/// </summary>
internal sealed class ToolCallAudit : Entity
{
    public const int ToolMaxLength = 64;
    public const int ScopeMaxLength = 64;
    public const int OutcomeMaxLength = 40;
    public const int ClientMaxLength = 64;
    public const int TokenIdMaxLength = 64;
    public const int RequestIdMaxLength = 128;

    private ToolCallAudit()
    {
    }

    public Guid UserId { get; private set; }

    public string Tool { get; private set; } = string.Empty;

    public string Scope { get; private set; } = string.Empty;

    public string Outcome { get; private set; } = string.Empty;

    public int LatencyMs { get; private set; }

    /// <summary>Who called: the tutor agent for every delegated token in this pass.</summary>
    public string Client { get; private set; } = string.Empty;

    /// <summary>The delegated token's id, which ties the calls of one tutor turn together.</summary>
    public string? TokenId { get; private set; }

    /// <summary>Correlation id carried by the token (the API request that minted it).</summary>
    public string? RequestId { get; private set; }

    /// <summary>What the call created, for example the generation job of a new quiz.</summary>
    public Guid? ResourceId { get; private set; }

    public static ToolCallAudit Record(
        Guid userId,
        string tool,
        string scope,
        string outcome,
        TimeSpan latency,
        string client,
        string? tokenId,
        string? requestId,
        Guid? resourceId) => new()
        {
            UserId = userId,
            Tool = Clip(tool, ToolMaxLength),
            Scope = Clip(scope, ScopeMaxLength),
            Outcome = Clip(outcome, OutcomeMaxLength),
            LatencyMs = (int)Math.Clamp(latency.TotalMilliseconds, 0, int.MaxValue),
            Client = Clip(client, ClientMaxLength),
            TokenId = tokenId is null ? null : Clip(tokenId, TokenIdMaxLength),
            RequestId = requestId is null ? null : Clip(requestId, RequestIdMaxLength),
            ResourceId = resourceId,
        };

    private static string Clip(string value, int max) => value.Length <= max ? value : value[..max];
}
