using System.Collections.Concurrent;
using System.Globalization;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// Strict, partitioned limits on the auth endpoints. Endpoint policies partition by client IP (or user id when
/// signed in); <see cref="EmailRateLimiter"/> adds a per-email limit inside the handlers, which is the guard that
/// still holds when many users share one IP (for example behind the web app's BFF). Every rejection, whether from
/// a policy, the per-email limiter or an account lockout, is the same 429 built by <see cref="TooManyAttempts"/>.
/// </summary>
internal static class AuthRateLimiting
{
    public const string Register = "identity-register";
    public const string Login = "identity-login";
    public const string PasswordReset = "identity-password-reset";
    public const string Verification = "identity-verification";
    public const string Refresh = "identity-refresh";

    public const string SignInDetail = "Too many sign-in attempts. Try again in a few minutes.";
    public const string GenericDetail = "Too many attempts. Try again in a few minutes.";

    public static void AddPolicies(RateLimiterOptions limiter, AuthOptions auth)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(auth);

        var limits = auth.RateLimits;
        limiter.AddPolicy(Register, new AuthPolicy(Register, limits.Register, GenericDetail));
        limiter.AddPolicy(Login, new AuthPolicy(Login, limits.Login, SignInDetail));
        limiter.AddPolicy(PasswordReset, new AuthPolicy(PasswordReset, limits.PasswordReset, GenericDetail));
        limiter.AddPolicy(Verification, new AuthPolicy(Verification, limits.Verification, GenericDetail));
        limiter.AddPolicy(Refresh, new AuthPolicy(Refresh, limits.Refresh, GenericDetail));
    }

    /// <summary>The one 429 every identity limit and the login lockout return, so none of them reveals that an account exists.</summary>
    public static Error TooManyAttempts(TimeSpan retryAfter, string detail = SignInDetail) =>
        Error.TooManyRequests("identity.too_many_attempts", detail).With("retryAfterSeconds", RetryAfterSeconds(retryAfter));

    public static int RetryAfterSeconds(TimeSpan retryAfter) => Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));

    /// <summary>Writes the Retry-After header for a 429 built by <see cref="TooManyAttempts"/>; other errors pass through.</summary>
    public static Error WithRetryAfterHeader(this Error error, HttpResponse response)
    {
        ArgumentNullException.ThrowIfNull(error);
        ArgumentNullException.ThrowIfNull(response);
        if (error.Extensions?.TryGetValue("retryAfterSeconds", out var seconds) == true && seconds is int value)
        {
            response.Headers.RetryAfter = value.ToString(CultureInfo.InvariantCulture);
        }

        return error;
    }

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";

    private sealed class AuthPolicy(string name, RateLimitWindow window, string detail) : IRateLimiterPolicy<string>
    {
        public Func<OnRejectedContext, CancellationToken, ValueTask>? OnRejected { get; } = async (context, _) =>
        {
            var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var value) ? value : window.Window;
            var error = TooManyAttempts(retryAfter, detail).WithRetryAfterHeader(context.HttpContext.Response);
            await error.ToProblem().ExecuteAsync(context.HttpContext);
        };

        public RateLimitPartition<string> GetPartition(HttpContext httpContext) =>
            RateLimitPartition.GetFixedWindowLimiter(
                $"{name}:{PartitionKey(httpContext)}",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = window.PermitLimit, Window = window.Window, QueueLimit = 0 });
    }
}

/// <summary>
/// Per-email limits applied whether or not the account exists. Sign-in counts failures, not attempts, with the
/// same threshold and duration as the Identity lockout, so an unknown email that keeps failing is blocked exactly
/// like a real account that locks. State is per instance; the Identity lockout on the user row is the shared guard.
/// </summary>
internal sealed class EmailRateLimiter : IDisposable
{
    private const int SweepThreshold = 10_000;

    private readonly ConcurrentDictionary<string, LoginFailures> _logins = new(StringComparer.Ordinal);
    private readonly PartitionedRateLimiter<string> _passwordReset;
    private readonly PartitionedRateLimiter<string> _verification;
    private readonly PartitionedRateLimiter<string> _ageData;
    private readonly IClock _clock;
    private readonly int _maxFailures;
    private readonly TimeSpan _window;

    public EmailRateLimiter(IOptions<AuthOptions> options, IClock clock)
    {
        ArgumentNullException.ThrowIfNull(options);
        var settings = options.Value;
        var limits = settings.RateLimits;
        _clock = clock;
        _maxFailures = limits.LoginPerEmail.PermitLimit;
        _window = limits.LoginPerEmail.Window;
        _passwordReset = Create(limits.PasswordResetPerEmail);
        _verification = Create(limits.VerificationPerEmail);
        _ageData = Create(limits.Verification);
    }

    /// <summary>How long sign-in stays blocked for this email, or null when it is not blocked.</summary>
    public TimeSpan? LoginBlockedFor(string normalizedEmail)
    {
        var now = _clock.UtcNow;
        if (!_logins.TryGetValue(normalizedEmail, out var state))
        {
            return null;
        }

        lock (state)
        {
            return state.BlockedUntil is { } until && until > now ? until - now : null;
        }
    }

    /// <summary>Counts a failed sign-in. Returns how long the email is now blocked when this failure reached the limit.</summary>
    public TimeSpan? RecordLoginFailure(string normalizedEmail)
    {
        var now = _clock.UtcNow;
        SweepIfLarge(now);
        var state = _logins.GetOrAdd(normalizedEmail, _ => new LoginFailures());
        lock (state)
        {
            if (state.BlockedUntil is { } until && until > now)
            {
                return until - now;
            }

            if (state.WindowStart + _window <= now)
            {
                state.WindowStart = now;
                state.Count = 0;
            }

            state.Count++;
            if (state.Count < _maxFailures)
            {
                return null;
            }

            state.BlockedUntil = now + _window;
            state.Count = 0;
            return _window;
        }
    }

    public void ClearLogin(string normalizedEmail) => _logins.TryRemove(normalizedEmail, out _);

    public bool TryAcquirePasswordReset(string normalizedEmail) => TryAcquire(_passwordReset, normalizedEmail);

    public bool TryAcquireVerification(string normalizedEmail) => TryAcquire(_verification, normalizedEmail);

    /// <summary>Setting a date of birth or the adult confirmation, per user.</summary>
    public bool TryAcquireAgeData(Guid userId) => TryAcquire(_ageData, userId.ToString("N"));

    public void Dispose()
    {
        _passwordReset.Dispose();
        _verification.Dispose();
        _ageData.Dispose();
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

    // Bounds memory when many distinct emails fail: entries whose window and block have both ended carry no state.
    private void SweepIfLarge(DateTimeOffset now)
    {
        if (_logins.Count < SweepThreshold)
        {
            return;
        }

        foreach (var (key, state) in _logins)
        {
            lock (state)
            {
                if (state.WindowStart + _window <= now && (state.BlockedUntil is null || state.BlockedUntil <= now))
                {
                    _logins.TryRemove(key, out _);
                }
            }
        }
    }

    private sealed class LoginFailures
    {
        public int Count { get; set; }

        public DateTimeOffset WindowStart { get; set; }

        public DateTimeOffset? BlockedUntil { get; set; }
    }
}
