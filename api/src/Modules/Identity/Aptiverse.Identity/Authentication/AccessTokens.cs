using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Aptiverse.Identity.Authentication;

internal sealed record AccessToken(string Token, DateTimeOffset ExpiresAt);

/// <summary>
/// Issues short-lived ES256 access tokens. Claims are sub, email, roles and sid (the session). Permissions are
/// not in the token: they are derived from roles on the server, and /me lists them for the web app.
/// </summary>
internal sealed class AccessTokenIssuer(SigningKeys keys, IOptions<AuthOptions> options, IClock clock)
{
    private static readonly JsonWebTokenHandler Handler = new() { SetDefaultTimesOnTokenCreation = false };

    public AccessToken Issue(Guid userId, string email, IReadOnlyList<string> roles, Guid sessionId)
    {
        var settings = options.Value;
        var now = clock.UtcNow;
        var expires = now.AddMinutes(settings.AccessTokenMinutes);

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = settings.Issuer,
            Audience = settings.Audience,
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expires.UtcDateTime,
            SigningCredentials = keys.Credentials,
            Claims = new Dictionary<string, object>
            {
                [AptiverseClaims.Subject] = userId.ToString(),
                [AptiverseClaims.Email] = email,
                [AptiverseClaims.Roles] = roles.ToArray(),
                [AptiverseClaims.SessionId] = sessionId.ToString(),
                [JwtRegisteredClaimNames.Jti] = Guid.CreateVersion7().ToString(),
            },
        };

        return new AccessToken(Handler.CreateToken(descriptor), expires);
    }

    public static TokenValidationParameters ValidationParameters(AuthOptions settings, SigningKeys keys)
    {
        ArgumentNullException.ThrowIfNull(settings);
        ArgumentNullException.ThrowIfNull(keys);

        return new TokenValidationParameters
        {
            ValidIssuer = settings.Issuer,
            ValidAudience = settings.Audience,
            IssuerSigningKeys = keys.ValidationKeys,
            ValidAlgorithms = [SecurityAlgorithms.EcdsaSha256],
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            RequireExpirationTime = true,
            RequireSignedTokens = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = AptiverseClaims.Subject,
            RoleClaimType = AptiverseClaims.Roles,
        };
    }
}
