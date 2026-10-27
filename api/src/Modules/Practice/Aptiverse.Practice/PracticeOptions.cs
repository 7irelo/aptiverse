using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;

namespace Aptiverse.Practice;

/// <summary>Practice limits and timings. Every value has a safe default; config may only tune it within the ranges.</summary>
internal sealed class PracticeOptions
{
    public const string SectionName = "Practice";

    [Range(5, 40)]
    public int DefaultQuestionCount { get; set; } = 10;

    /// <summary>Network allowance after a timed attempt's deadline for answers already in flight (decision 17).</summary>
    [Range(0, 60)]
    public int NetworkGraceSeconds { get; set; } = 10;

    /// <summary>An untimed attempt idle for this long stops blocking the tutor.</summary>
    [Range(1, 168)]
    public int UntimedIdleHours { get; set; } = 24;

    /// <summary>Tests a student may generate per UTC day. Deleted tests still count.</summary>
    [Range(1, 1000)]
    public int DailyGenerationLimit { get; set; } = 10;

    /// <summary>Calls made to start a job on the ai service before the job fails.</summary>
    [Range(1, 5)]
    public int MaxGenerationAttempts { get; set; } = 3;

    /// <summary>Calls made to the written grader before answers are left "not marked yet".</summary>
    [Range(1, 10)]
    public int MaxGradingAttempts { get; set; } = 3;

    /// <summary>Seconds between status reads of a running generation job.</summary>
    [Range(1, 3600)]
    public int GenerationPollSeconds { get; set; } = 5;

    /// <summary>How long the poller waits for a job before failing it.</summary>
    [Range(1, 120)]
    public int GenerationTimeoutMinutes { get; set; } = 10;

    /// <summary>Base delay before retrying a failed ai call; doubled on each further attempt.</summary>
    [Range(1, 3600)]
    public int RetryBaseSeconds { get; set; } = 10;

    /// <summary>Focus losses closer together than this are counted once.</summary>
    [Range(0, 60)]
    public int FocusLossCoalesceSeconds { get; set; } = 2;

    [Range(1, 10_000)]
    public int GeneratePermitLimit { get; set; } = 5;

    [Range(1, 10_000)]
    public int SubmitPermitLimit { get; set; } = 10;

    [Range(1, 10_000)]
    public int AutosavePermitLimit { get; set; } = 120;

    [Range(1, 10_000)]
    public int FocusPermitLimit { get; set; } = 30;

    /// <summary>Window shared by the per-user practice rate limits.</summary>
    [Range(1, 3600)]
    public int RateLimitWindowSeconds { get; set; } = 60;

    public TimeSpan NetworkGrace => TimeSpan.FromSeconds(NetworkGraceSeconds);
}

/// <summary>Per-user burst limits on the practice routes, partitioned by user id (client IP when anonymous).</summary>
internal static class PracticeRateLimiting
{
    public const string Generate = "practice-generate";
    public const string Submit = "practice-submit";
    public const string Autosave = "practice-autosave";
    public const string Focus = "practice-focus";

    public static void AddPolicies(RateLimiterOptions limiter, PracticeOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        Add(limiter, Generate, options.GeneratePermitLimit, options.RateLimitWindowSeconds);
        Add(limiter, Submit, options.SubmitPermitLimit, options.RateLimitWindowSeconds);
        Add(limiter, Autosave, options.AutosavePermitLimit, options.RateLimitWindowSeconds);
        Add(limiter, Focus, options.FocusPermitLimit, options.RateLimitWindowSeconds);
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
