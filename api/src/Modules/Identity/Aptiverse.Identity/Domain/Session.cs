using Aptiverse.SharedKernel.Domain;
using Microsoft.AspNetCore.Http;

namespace Aptiverse.Identity.Domain;

/// <summary>
/// One signed-in device. Its id is the refresh token family id and the access token's sid claim, so revoking
/// the session ends both the refresh chain and every access token issued for it.
/// </summary>
internal sealed class Session : Entity
{
    public const int IpMaxLength = 64;
    public const int UserAgentMaxLength = 512;
    public const int ReasonMaxLength = 32;

    private Session()
    {
    }

    public Guid UserId { get; private set; }

    public string AuthMethod { get; private set; } = string.Empty;

    public string? IpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    public DateTimeOffset LastSeenAt { get; private set; }

    public DateTimeOffset? RevokedAt { get; private set; }

    public string? RevokedReason { get; private set; }

    public static Session Start(Guid userId, string authMethod, RequestInfo request, DateTimeOffset now, TimeSpan absoluteLifetime) => new()
    {
        UserId = userId,
        AuthMethod = authMethod,
        IpAddress = request.IpAddress,
        UserAgent = request.UserAgent,
        ExpiresAt = now + absoluteLifetime,
        LastSeenAt = now,
    };

    public bool IsActive(DateTimeOffset now) => RevokedAt is null && ExpiresAt > now;

    public void Touch(DateTimeOffset now, RequestInfo request)
    {
        LastSeenAt = now;
        IpAddress = request.IpAddress ?? IpAddress;
        UserAgent = request.UserAgent ?? UserAgent;
    }

    public void Revoke(DateTimeOffset now, string reason)
    {
        if (RevokedAt is null)
        {
            RevokedAt = now;
            RevokedReason = reason;
        }
    }
}

internal static class AuthMethods
{
    public const string Password = "password";
    public const string Google = "google";

    public static IReadOnlyList<string> All { get; } = [Password, Google];
}

internal static class RevocationReasons
{
    public const string Logout = "logout";
    public const string SignedOutRemotely = "signed_out_remotely";
    public const string RefreshReuse = "refresh_reuse";
    public const string PasswordChanged = "password_changed";
    public const string PasswordReset = "password_reset";
    public const string AccountLinked = "account_linked";
}

/// <summary>Where a request came from, recorded on sessions, consents and security events.</summary>
internal sealed record RequestInfo(string? IpAddress, string? UserAgent)
{
    public static readonly RequestInfo Unknown = new(null, null);

    public static RequestInfo From(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        var userAgent = context.Request.Headers.UserAgent.ToString();
        return new(
            Truncate(context.Connection.RemoteIpAddress?.ToString(), Session.IpMaxLength),
            Truncate(string.IsNullOrWhiteSpace(userAgent) ? null : userAgent, Session.UserAgentMaxLength));
    }

    private static string? Truncate(string? value, int max) => value is not null && value.Length > max ? value[..max] : value;
}
