using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// Strict, partitioned limits on the anonymous auth endpoints. Endpoint policies partition by client IP (or
/// user id when signed in); <see cref="EmailRateLimiter"/> adds a per-email limit inside the handlers, which
/// is the guard that still holds when many users share one IP (for example behind the web app's BFF).
/// </summary>
internal static class AuthRateLimiting
{
    public const string Register = "identity-register";
    public const string Login = "identity-login";
    public const string PasswordReset = "identity-password-reset";
    public const string Verification = "identity-verification";
    public const string Refresh = "identity-refresh";

    public static void AddPolicies(RateLimiterOptions limiter, AuthOptions auth)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(auth);

        var limits = auth.RateLimits;
        Add(limiter, Register, limits.Register);
        Add(limiter, Login, limits.Login);
        Add(limiter, PasswordReset, limits.PasswordReset);
        Add(limiter, Verification, limits.Verification);
        Add(limiter, Refresh, limits.Refresh);
    }

    private static void Add(RateLimiterOptions limiter, string policy, RateLimitWindow window) =>
        limiter.AddPolicy(policy, context => RateLimitPartition.GetFixedWindowLimiter(
            $"{policy}:{PartitionKey(context)}",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = window.PermitLimit, Window = window.Window, QueueLimit = 0 }));

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
}

/// <summary>Per-email fixed windows for login and password reset requests, applied whether or not the account exists.</summary>
internal sealed class EmailRateLimiter : IDisposable
{
    public static readonly Error Limited =
        Error.TooManyRequests("identity.too_many_attempts", "Too many attempts for this email address. Please wait a few minutes and try again.");

    private readonly PartitionedRateLimiter<string> _login;
    private readonly PartitionedRateLimiter<string> _passwordReset;

    public EmailRateLimiter(IOptions<AuthOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        var limits = options.Value.RateLimits;
        _login = Create(limits.LoginPerEmail);
        _passwordReset = Create(limits.PasswordResetPerEmail);
    }

    public bool TryAcquireLogin(string normalizedEmail) => TryAcquire(_login, normalizedEmail);

    public bool TryAcquirePasswordReset(string normalizedEmail) => TryAcquire(_passwordReset, normalizedEmail);

    public void Dispose()
    {
        _login.Dispose();
        _passwordReset.Dispose();
    }

    private static bool TryAcquire(PartitionedRateLimiter<string> limiter, string key)
    {
        using var lease = limiter.AttemptAcquire(key);
        return lease.IsAcquired;
    }

    private static PartitionedRateLimiter<string> Create(RateLimitWindow window) =>
        PartitionedRateLimiter.Create<string, string>(key => RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions { PermitLimit = window.PermitLimit, Window = window.Window, QueueLimit = 0 }));
}
