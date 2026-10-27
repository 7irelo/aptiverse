using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// Validates delegated MCP tokens: the same ES256 keys and issuer as access tokens, but only the
/// <see cref="DelegatedMcpTokens.Audience"/> audience. Requests under <see cref="DelegatedMcpTokens.Path"/> are
/// forwarded here by the default scheme, so an access token presented at /mcp fails on its audience, and an MCP
/// token presented anywhere else fails the access token audience.
/// </summary>
internal sealed class ConfigureMcpBearerOptions(IOptions<AuthOptions> authOptions, SigningKeys keys) : IConfigureNamedOptions<JwtBearerOptions>
{
    private static readonly TimeSpan Skew = TimeSpan.FromSeconds(30);

    public void Configure(string? name, JwtBearerOptions options)
    {
        if (name == DelegatedMcpTokens.AuthenticationScheme)
        {
            Configure(options);
        }
    }

    public void Configure(JwtBearerOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var parameters = AccessTokenIssuer.ValidationParameters(authOptions.Value, keys);
        parameters.ValidAudience = DelegatedMcpTokens.Audience;
        parameters.ClockSkew = Skew;

        options.MapInboundClaims = false;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = parameters;
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                if (Reject(context.SecurityToken as JsonWebToken, context.Principal) is { } reason)
                {
                    context.Fail(reason);
                }

                return Task.CompletedTask;
            },
        };
    }

    private static string? Reject(JsonWebToken? token, System.Security.Claims.ClaimsPrincipal? principal)
    {
        if (token is null || principal?.GetUserId() is null)
        {
            return "The MCP token has no subject.";
        }

        // A session id means an access token; it never belongs here even if its audience were rewritten.
        if (principal.GetSessionId() is not null)
        {
            return "An access token is not an MCP token.";
        }

        if (!token.TryGetPayloadValue<string>(DelegatedMcpTokens.ScopeClaim, out var scope) || string.IsNullOrWhiteSpace(scope))
        {
            return "The MCP token carries no scope.";
        }

        if (!token.TryGetPayloadValue<string>(DelegatedMcpTokens.TokenIdClaim, out var jti) || string.IsNullOrWhiteSpace(jti))
        {
            return "The MCP token has no id.";
        }

        if (token.IssuedAt == DateTime.MinValue || token.ValidTo - token.IssuedAt > DelegatedMcpTokens.MaxLifetime)
        {
            return "The MCP token lives too long.";
        }

        return null;
    }
}
