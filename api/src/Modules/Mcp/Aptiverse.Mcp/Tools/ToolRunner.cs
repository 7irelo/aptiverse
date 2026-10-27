using System.Data.Common;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using Aptiverse.Identity.Contracts;
using Aptiverse.Mcp.Domain;
using Aptiverse.Mcp.Persistence;
using Aptiverse.Practice.Contracts;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Protocol;

namespace Aptiverse.Mcp.Tools;

/// <summary>
/// The one path every tool call takes. In order: the caller must be a student with a delegated token; the token must
/// carry the tool's scope; the arguments must match the pinned schema; the student must have no practice attempt in
/// progress (checked fail closed); write tools must be inside their rate limit. Then the tool runs under the timeout,
/// and an audit row is written whatever happened. The user id only ever comes from the token, never from arguments.
/// </summary>
internal sealed partial class ToolRunner(
    IServiceScopeFactory scopes,
    IActiveAttemptLookup activeAttempts,
    WriteToolLimiter writeLimiter,
    IOptions<McpOptions> options,
    ILogger<ToolRunner> logger)
{
    /// <summary>Every delegated token in this pass is minted for the tutor agent.</summary>
    public const string TutorClient = "aptiverse-tutor";

    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public async Task<CallToolResult> RunAsync(
        AptiverseTool tool,
        ClaimsPrincipal user,
        IReadOnlyDictionary<string, JsonElement> arguments,
        IServiceProvider services,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(tool);
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(arguments);

        var started = Stopwatch.GetTimestamp();
        var userId = user.GetUserId();
        var tokenId = user.FindFirstValue(DelegatedMcpTokens.TokenIdClaim);
        if (userId is null || string.IsNullOrWhiteSpace(tokenId) || !user.HasClaim(AptiverseClaims.Roles, Roles.Student))
        {
            // The endpoint policy already demands all of this; a call that gets here without it names no user to audit.
            return Render(ToolOutcome.Fail(ToolOutcomes.Unauthorized, "This tool needs a student's delegated token."));
        }

        ToolOutcome outcome;
        try
        {
            outcome = await CheckAndRunAsync(tool, user, new ToolCall(userId.Value, tokenId, arguments, services), cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            outcome = ToolOutcome.Fail(ToolOutcomes.Failed, "The call was cancelled.");
            await AuditAsync(userId.Value, tool, outcome, Stopwatch.GetElapsedTime(started), tokenId, user.FindFirstValue(DelegatedMcpTokens.RequestIdClaim));
            throw;
        }
#pragma warning disable CA1031 // A bug in one tool still produces an audit row and a typed error, never internals.
        catch (Exception ex)
#pragma warning restore CA1031
        {
            LogFailed(logger, tool.Definition.Name, userId.Value, ex);
            outcome = ToolOutcome.Fail(ToolOutcomes.Failed, "The tool failed. Try again later.");
        }

        var latency = Stopwatch.GetElapsedTime(started);
        await AuditAsync(userId.Value, tool, outcome, latency, tokenId, user.FindFirstValue(DelegatedMcpTokens.RequestIdClaim));
        McpMetrics.ToolCalled(tool.Definition.Name, outcome.Code, latency);
        return Render(outcome);
    }

    private async Task<ToolOutcome> CheckAndRunAsync(AptiverseTool tool, ClaimsPrincipal user, ToolCall call, CancellationToken cancellationToken)
    {
        if (!Scopes(user).Contains(tool.Definition.Scope, StringComparer.Ordinal))
        {
            return ToolOutcome.Fail(ToolOutcomes.MissingScope, "This turn is not allowed to use this tool.");
        }

        if (tool.Schema.Validate(call.Arguments) is { } problem)
        {
            return ToolOutcome.Fail(ToolOutcomes.InvalidArguments, problem);
        }

        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(options.Value.ToolTimeout);
        try
        {
            if (await activeAttempts.GetActiveAttemptAsync(call.UserId, timeout.Token) is not null)
            {
                return ToolOutcome.Fail(
                    ToolOutcomes.BlockedDuringAttempt,
                    "The student has a practice test in progress. No tools are available until it is submitted.");
            }

            if (tool.Writes && !writeLimiter.TryAcquire(call.UserId))
            {
                return ToolOutcome.Fail(ToolOutcomes.RateLimited, "Too many quizzes were requested recently. Try again later.");
            }

            return await tool.ExecuteAsync(call, timeout.Token);
        }
        catch (OperationCanceledException) when (timeout.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            LogTimedOut(logger, tool.Definition.Name, call.UserId);
            return ToolOutcome.Fail(ToolOutcomes.Timeout, "The tool took too long. Try again in a moment.");
        }
        catch (Exception ex) when (ex is DbException or TimeoutException or InvalidOperationException)
        {
            LogFailed(logger, tool.Definition.Name, call.UserId, ex);
            return ToolOutcome.Fail(ToolOutcomes.Unavailable, "The tool is unavailable right now.");
        }
    }

    private static IEnumerable<string> Scopes(ClaimsPrincipal user) =>
        user.FindAll(DelegatedMcpTokens.ScopeClaim).SelectMany(c => c.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries));

    private async Task AuditAsync(Guid userId, AptiverseTool tool, ToolOutcome outcome, TimeSpan latency, string? tokenId, string? requestId)
    {
        // A fresh scope and no request token: a timed out or cancelled call is still recorded.
        try
        {
            await using var scope = scopes.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<McpDbContext>();
            db.ToolCalls.Add(ToolCallAudit.Record(
                userId, tool.Definition.Name, tool.Definition.Scope, outcome.Code, latency, TutorClient, tokenId, requestId, outcome.ResourceId));
            await db.SaveChangesAsync(CancellationToken.None);
        }
        catch (Exception ex) when (ex is DbException or Microsoft.EntityFrameworkCore.DbUpdateException or InvalidOperationException)
        {
            LogAuditFailed(logger, tool.Definition.Name, userId, ex);
        }
    }

    private static CallToolResult Render(ToolOutcome outcome)
    {
        var text = outcome.Succeeded
            ? JsonSerializer.Serialize(outcome.Payload, Json)
            : JsonSerializer.Serialize(new { error = outcome.Code, message = outcome.Message }, Json);
        return new CallToolResult
        {
            Content = [new TextContentBlock { Text = text }],
            IsError = !outcome.Succeeded,
        };
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "MCP tool {Tool} timed out for user {UserId}")]
    private static partial void LogTimedOut(ILogger logger, string tool, Guid userId);

    [LoggerMessage(Level = LogLevel.Error, Message = "MCP tool {Tool} failed for user {UserId}")]
    private static partial void LogFailed(ILogger logger, string tool, Guid userId, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Could not write the audit row of MCP tool {Tool} for user {UserId}")]
    private static partial void LogAuditFailed(ILogger logger, string tool, Guid userId, Exception exception);
}

/// <summary>
/// Per-user limit on write tools, in memory per instance. Practice's daily generation limit is the durable cap; this
/// one stops a looping agent from burning it in seconds.
/// </summary>
internal sealed class WriteToolLimiter : IDisposable
{
    private readonly PartitionedRateLimiter<Guid> _limiter;

    public WriteToolLimiter(IOptions<McpOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        var settings = options.Value;
        _limiter = PartitionedRateLimiter.Create<Guid, Guid>(userId => RateLimitPartition.GetFixedWindowLimiter(
            userId,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = settings.QuizPermitLimit,
                Window = TimeSpan.FromSeconds(settings.QuizWindowSeconds),
                QueueLimit = 0,
            }));
    }

    public bool TryAcquire(Guid userId)
    {
        using var lease = _limiter.AttemptAcquire(userId);
        return lease.IsAcquired;
    }

    public void Dispose() => _limiter.Dispose();
}
