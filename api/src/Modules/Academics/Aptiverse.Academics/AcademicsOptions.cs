using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;

namespace Aptiverse.Academics;

/// <summary>Per-student limits on academics data. Every value has a safe default; config may only tighten or tune it.</summary>
internal sealed class AcademicsOptions
{
    public const string SectionName = "Academics";

    /// <summary>Active enrolments a student may hold at once.</summary>
    [Range(1, 50)]
    public int MaxActiveUnits { get; set; } = 15;

    [Range(1, 1000)]
    public int MaxAssessmentsPerEnrolment { get; set; } = 200;

    /// <summary>Canonical topics a unit's registry may hold; new labels beyond it are not registered.</summary>
    [Range(1, 5000)]
    public int MaxTopicsPerUnit { get; set; } = 500;

    /// <summary>Burst limit on creating units and assessments, per user, on top of the global limit.</summary>
    [Range(1, 10_000)]
    public int WritePermitLimit { get; set; } = 30;

    [Range(1, 3600)]
    public int WriteWindowSeconds { get; set; } = 60;
}

/// <summary>Create endpoints share one per-user burst limit, partitioned by user id (client IP when anonymous).</summary>
internal static class AcademicsRateLimiting
{
    public const string Write = "academics-write";

    public static void AddPolicies(RateLimiterOptions limiter, AcademicsOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        limiter.AddPolicy(Write, context => RateLimitPartition.GetFixedWindowLimiter(
            $"{Write}:{PartitionKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = options.WritePermitLimit,
                Window = TimeSpan.FromSeconds(options.WriteWindowSeconds),
                QueueLimit = 0,
            }));
    }

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
}
