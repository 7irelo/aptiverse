using System.Security.Claims;
using System.Text.Encodings.Web;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.IntegrationTests;

/// <summary>Authenticates only requests that carry the test role header; everything else is anonymous.</summary>
internal sealed class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";
    public const string RoleHeader = "X-Test-Role";
    public const string UserHeader = "X-Test-User";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(RoleHeader, out var role))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        // A fixed user id lets a test act as the same person across requests; otherwise every request is a stranger.
        var userId = Request.Headers.TryGetValue(UserHeader, out var user) && Guid.TryParse(user, out var parsed)
            ? parsed
            : Guid.CreateVersion7();

        var identity = new ClaimsIdentity(
            [new Claim(AptiverseClaims.Subject, userId.ToString()), new Claim(AptiverseClaims.Roles, role.ToString())],
            SchemeName,
            nameType: AptiverseClaims.Subject,
            roleType: AptiverseClaims.Roles);

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
    }
}
