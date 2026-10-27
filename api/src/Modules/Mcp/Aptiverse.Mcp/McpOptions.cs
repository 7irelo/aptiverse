using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;

namespace Aptiverse.Mcp;

/// <summary>MCP server limits. Every value has a safe default; config may only tune it within the ranges.</summary>
internal sealed class McpOptions
{
    public const string SectionName = "Mcp";

    /// <summary>A tool that takes longer is cut off and answers "timeout".</summary>
    [Range(1, 30)]
    public int ToolTimeoutSeconds { get; set; } = 5;

    /// <summary>MCP requests (any method) per user per window.</summary>
    [Range(1, 10_000)]
    public int PermitLimit { get; set; } = 60;

    [Range(1, 3600)]
    public int WindowSeconds { get; set; } = 60;

    /// <summary>create_practice_quiz calls per user per window, on top of Practice's own daily limit.</summary>
    [Range(1, 1000)]
    public int QuizPermitLimit { get; set; } = 5;

    [Range(60, 86_400)]
    public int QuizWindowSeconds { get; set; } = 3600;

    /// <summary>Largest MCP request body. Tool arguments are tiny; anything bigger is refused before parsing.</summary>
    [Range(1024, 1024 * 1024)]
    public int MaxRequestBytes { get; set; } = 32 * 1024;

    public TimeSpan ToolTimeout => TimeSpan.FromSeconds(ToolTimeoutSeconds);
}

/// <summary>
/// Per-user limit on /mcp. The default scheme forwards /mcp to the delegated MCP scheme, so the caller is known
/// here and the partition is the student; an unauthenticated caller is limited by client IP.
/// </summary>
internal static class McpRateLimiting
{
    public const string Policy = "mcp";

    public static void AddPolicies(RateLimiterOptions limiter, McpOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        limiter.AddPolicy(Policy, context => RateLimitPartition.GetFixedWindowLimiter(
            $"{Policy}:{PartitionKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = options.PermitLimit,
                Window = TimeSpan.FromSeconds(options.WindowSeconds),
                QueueLimit = 0,
            }));
    }

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
}
