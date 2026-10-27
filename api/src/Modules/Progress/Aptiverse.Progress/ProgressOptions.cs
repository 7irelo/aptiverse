using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;

namespace Aptiverse.Progress;

/// <summary>Progress limits. Every value has a safe default; config may only tune it within the ranges.</summary>
internal sealed class ProgressOptions
{
    public const string SectionName = "Progress";

    /// <summary>Open goals per student. A guard against abuse until Billing owns the goals.unlimited entitlement.</summary>
    [Range(1, 100)]
    public int MaxActiveGoals { get; set; } = 10;

    /// <summary>How many questions of evidence one recorded assessment mark counts as in the whole-unit mastery row.</summary>
    [Range(1, 50)]
    public int MarkQuestionEquivalents { get; set; } = 10;

    /// <summary>Goal creations per user per hour (spec BE-PRG-52).</summary>
    [Range(1, 10_000)]
    public int GoalCreatePermitLimit { get; set; } = 30;

    [Range(60, 86_400)]
    public int GoalCreateWindowSeconds { get; set; } = 3600;

    /// <summary>Other goal and milestone writes per user per window.</summary>
    [Range(1, 10_000)]
    public int GoalWritePermitLimit { get; set; } = 60;

    [Range(1, 3600)]
    public int GoalWriteWindowSeconds { get; set; } = 60;
}

/// <summary>Per-user limits on progress writes, partitioned by user id (client IP when anonymous).</summary>
internal static class ProgressRateLimiting
{
    public const string GoalCreate = "progress-goals-create";
    public const string GoalWrite = "progress-goals-write";

    public static void AddPolicies(RateLimiterOptions limiter, ProgressOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        Add(limiter, GoalCreate, options.GoalCreatePermitLimit, options.GoalCreateWindowSeconds);
        Add(limiter, GoalWrite, options.GoalWritePermitLimit, options.GoalWriteWindowSeconds);
    }

    private static void Add(RateLimiterOptions limiter, string policy, int permits, int windowSeconds) =>
        limiter.AddPolicy(policy, context => RateLimitPartition.GetFixedWindowLimiter(
            $"{policy}:{PartitionKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permits,
                Window = TimeSpan.FromSeconds(windowSeconds),
                QueueLimit = 0,
            }));

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
}
