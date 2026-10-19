using System.Security.Claims;

namespace Aptiverse.SharedKernel.Authorization;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);
        return Guid.TryParse(principal.FindFirstValue(AptiverseClaims.Subject), out var id) ? id : null;
    }

    /// <summary>For endpoints that already require authentication, where a missing subject is a bug.</summary>
    public static Guid GetRequiredUserId(this ClaimsPrincipal principal) =>
        principal.GetUserId() ?? throw new InvalidOperationException("The authenticated principal has no subject claim.");

    public static Guid? GetSessionId(this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);
        return Guid.TryParse(principal.FindFirstValue(AptiverseClaims.SessionId), out var id) ? id : null;
    }
}
