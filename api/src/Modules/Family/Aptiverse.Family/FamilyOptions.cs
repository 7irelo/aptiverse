using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;

namespace Aptiverse.Family;

/// <summary>Family limits. Every value has a safe default; config may only tune it within the ranges.</summary>
internal sealed class FamilyOptions
{
    public const string SectionName = "Family";

    /// <summary>
    /// The web app origin invite links point at. Falls back to Auth:WebAppUrl. Notifications rebuilds every emailed
    /// link on its own configured origin anyway, keeping only the token.
    /// </summary>
    public Uri? WebAppUrl { get; set; }

    /// <summary>How long an emailed invite stays valid.</summary>
    [Range(1, 336)]
    public int InviteExpiryHours { get; set; } = 168;

    /// <summary>How long a student's link code stays valid. Short, because the code is typed by hand and has less entropy than a token.</summary>
    [Range(1, 60)]
    public int LinkCodeExpiryMinutes { get; set; } = 15;

    /// <summary>Wrong guesses one code survives before it is burned (its selector matched, the rest did not).</summary>
    [Range(1, 20)]
    public int LinkCodeMaxAttempts { get; set; } = 5;

    /// <summary>Wrong codes one parent may enter per <see cref="LinkCodeFailureWindowMinutes"/> before redeeming is blocked.</summary>
    [Range(1, 100)]
    public int LinkCodeMaxFailures { get; set; } = 5;

    [Range(1, 1440)]
    public int LinkCodeFailureWindowMinutes { get; set; } = 60;

    /// <summary>
    /// Linked children for a parent without a parent plan. A parent.N plan raises it to N (Billing entitlement), never
    /// above <see cref="MaxChildren"/>.
    /// </summary>
    [Range(0, 20)]
    public int ChildrenWithoutPlan { get; set; } = 1;

    /// <summary>The hard ceiling on active children per parent, whatever the plan (spec: 6).</summary>
    [Range(1, 20)]
    public int MaxChildren { get; set; } = 6;

    /// <summary>Active parents per student (spec: 4).</summary>
    [Range(1, 20)]
    public int MaxParents { get; set; } = 4;

    /// <summary>The parental consent text version a parent must confirm. Bump it when the legal text changes.</summary>
    [Required]
    [RegularExpression("^[A-Za-z0-9._-]{1,20}$")]
    public string ParentalConsentVersion { get; set; } = "2026-10-28";

    /// <summary>Invites sent per parent per window (spec family-invite: 10 a day).</summary>
    [Range(1, 10_000)]
    public int InvitePermitLimit { get; set; } = 10;

    [Range(60, 86_400)]
    public int InviteWindowSeconds { get; set; } = 86_400;

    /// <summary>Invite accepts and link code redemptions per user per window (spec family-token: 20 an hour).</summary>
    [Range(1, 10_000)]
    public int TokenPermitLimit { get; set; } = 20;

    [Range(60, 86_400)]
    public int TokenWindowSeconds { get; set; } = 3600;

    /// <summary>Link codes a student may generate per window.</summary>
    [Range(1, 10_000)]
    public int LinkCodePermitLimit { get; set; } = 10;

    [Range(60, 86_400)]
    public int LinkCodeWindowSeconds { get; set; } = 3600;

    /// <summary>Other family writes (unlink, revoke, sharing, consent, cancel) per user per window.</summary>
    [Range(1, 10_000)]
    public int WritePermitLimit { get; set; } = 60;

    [Range(1, 3600)]
    public int WriteWindowSeconds { get; set; } = 60;
}

/// <summary>Per-user limits on family routes, partitioned by user id (client IP when anonymous).</summary>
internal static class FamilyRateLimiting
{
    public const string Invite = "family-invite";
    public const string Token = "family-token";
    public const string LinkCode = "family-link-code";
    public const string Write = "family-write";

    public static void AddPolicies(RateLimiterOptions limiter, FamilyOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        Add(limiter, Invite, options.InvitePermitLimit, options.InviteWindowSeconds);
        Add(limiter, Token, options.TokenPermitLimit, options.TokenWindowSeconds);
        Add(limiter, LinkCode, options.LinkCodePermitLimit, options.LinkCodeWindowSeconds);
        Add(limiter, Write, options.WritePermitLimit, options.WriteWindowSeconds);
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
