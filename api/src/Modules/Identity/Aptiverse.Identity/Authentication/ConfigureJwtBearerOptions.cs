using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

/// <summary>Validates Aptiverse access tokens locally (no metadata calls) and rejects tokens of ended sessions.</summary>
internal sealed class ConfigureJwtBearerOptions(IOptions<AuthOptions> authOptions, SigningKeys keys) : IConfigureNamedOptions<JwtBearerOptions>
{
    public void Configure(string? name, JwtBearerOptions options)
    {
        if (name == JwtBearerDefaults.AuthenticationScheme)
        {
            Configure(options);
        }
    }

    public void Configure(JwtBearerOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        options.MapInboundClaims = false;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = AccessTokenIssuer.ValidationParameters(authOptions.Value, keys);
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var sessionId = context.Principal?.GetSessionId();
                if (sessionId is null)
                {
                    context.Fail("The access token has no session.");
                    return;
                }

                var sessions = context.HttpContext.RequestServices.GetRequiredService<SessionRevocationCache>();
                if (!await sessions.IsActiveAsync(sessionId.Value, context.HttpContext.RequestAborted))
                {
                    context.Fail("The session has ended.");
                }
            },
        };
    }
}
