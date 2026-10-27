using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// Signs per-call service tokens with the same ES256 key as access tokens, so internal services verify them
/// against the published JWKS. Claims are sub, aud, iss, iat, nbf, exp, scope, roles, rid and jti. There is
/// no sid, and the audience can never be the access token audience, so the JwtBearer pipeline of this API
/// rejects a service token twice over.
/// </summary>
internal sealed class ServiceTokenIssuer(SigningKeys keys, IOptions<AuthOptions> options, IClock clock) : IServiceTokenIssuer
{
    public const string ScopeClaim = "scope";
    public const string RequestIdClaim = "rid";
    public const int MaxRequestIdLength = 128;

    public static readonly TimeSpan MaxLifetime = TimeSpan.FromMinutes(5);

    private static readonly JsonWebTokenHandler Handler = new() { SetDefaultTimesOnTokenCreation = false };

    public string Issue(ServiceTokenRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        var settings = options.Value;

        if (request.UserId == Guid.Empty)
        {
            throw new ArgumentException("A service token needs a user.", nameof(request));
        }

        if (request.Lifetime <= TimeSpan.Zero || request.Lifetime > MaxLifetime)
        {
            throw new ArgumentOutOfRangeException(nameof(request), request.Lifetime, "A service token lives more than zero and at most five minutes.");
        }

        var audience = request.Audience?.Trim();
        if (string.IsNullOrEmpty(audience))
        {
            throw new ArgumentException("A service token needs an audience.", nameof(request));
        }

        if (IsAccessTokenAudience(audience, settings.Audience))
        {
            throw new ArgumentException("A service token must never carry the access token audience.", nameof(request));
        }

        var scopes = Clean(request.Scopes, nameof(request.Scopes));
        var roles = Clean(request.Roles, nameof(request.Roles));

        var now = clock.UtcNow;
        var claims = new Dictionary<string, object>
        {
            [AptiverseClaims.Subject] = request.UserId.ToString(),
            [AptiverseClaims.Roles] = roles,
            [ScopeClaim] = string.Join(' ', scopes),
            [JwtRegisteredClaimNames.Jti] = Guid.CreateVersion7().ToString(),
        };

        if (!string.IsNullOrWhiteSpace(request.RequestId))
        {
            var requestId = request.RequestId.Trim();
            claims[RequestIdClaim] = requestId.Length > MaxRequestIdLength ? requestId[..MaxRequestIdLength] : requestId;
        }

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = settings.Issuer,
            Audience = audience,
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = now.Add(request.Lifetime).UtcDateTime,
            SigningCredentials = keys.Credentials,
            Claims = claims,
        };

        return Handler.CreateToken(descriptor);
    }

    // Audience matching in verifiers is ordinal, but a near miss (case, trailing slash) is still a mistake.
    private static bool IsAccessTokenAudience(string audience, string accessTokenAudience) =>
        string.Equals(audience.TrimEnd('/'), accessTokenAudience.Trim().TrimEnd('/'), StringComparison.OrdinalIgnoreCase);

    private static string[] Clean(IReadOnlyCollection<string>? values, string name)
    {
        if (values is null)
        {
            throw new ArgumentException($"{name} is required (it may be empty).", name);
        }

        var cleaned = new List<string>(values.Count);
        foreach (var value in values)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Any(char.IsWhiteSpace))
            {
                throw new ArgumentException($"{name} entries must be non-empty and contain no whitespace.", name);
            }

            if (!cleaned.Contains(value, StringComparer.Ordinal))
            {
                cleaned.Add(value);
            }
        }

        return [.. cleaned];
    }
}
