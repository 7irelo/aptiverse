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

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(RoleHeader, out var role))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var identity = new ClaimsIdentity(
            [new Claim(AptiverseClaims.Subject, Guid.CreateVersion7().ToString()), new Claim(AptiverseClaims.Roles, role.ToString())],
            SchemeName,
            nameType: AptiverseClaims.Subject,
            roleType: AptiverseClaims.Roles);

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
    }
}
