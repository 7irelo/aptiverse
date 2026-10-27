using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;

namespace Aptiverse.Identity.Features.Common;

/// <summary>
/// Returned by register, login, refresh and Google sign-in. The web app is a BFF that keeps both tokens server side;
/// the API never sets cookies.
/// </summary>
/// <param name="AccessToken">ES256 JWT for the Authorization: Bearer header; valid for 15 minutes.</param>
/// <param name="AccessTokenExpiresAt">When the access token stops working.</param>
/// <param name="RefreshToken">Single use: each refresh returns a new one, and presenting a used one ends the session.</param>
/// <param name="RefreshTokenExpiresAt">When the refresh token stops working unless used first; never after the session ends.</param>
/// <param name="User">Who signed in.</param>
internal sealed record AuthTokens(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    MeSummary User);

/// <param name="Id">The user id.</param>
/// <param name="Name">Display name.</param>
/// <param name="Email">Sign-in email address.</param>
/// <param name="EmailConfirmed">Whether the address has been verified.</param>
/// <param name="Roles">"student", "parent" or "admin".</param>
/// <param name="OnboardingRequired">True for students and parents until they complete onboarding.</param>
internal sealed record MeSummary(Guid Id, string Name, string Email, bool EmailConfirmed, IReadOnlyList<string> Roles, bool OnboardingRequired)
{
    public static MeSummary From(User user)
    {
        ArgumentNullException.ThrowIfNull(user);
        return new(user.Id, user.Name, user.Email, user.EmailConfirmed, user.RoleNames, user.RequiresOnboarding);
    }
}

/// <summary>Pairs a session's refresh token with a fresh access token.</summary>
internal sealed class AuthTokensFactory(AccessTokenIssuer issuer)
{
    public AuthTokens Create(User user, Session session, IssuedRefreshToken refresh)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(session);
        ArgumentNullException.ThrowIfNull(refresh);

        var access = issuer.Issue(user.Id, user.Email, user.RoleNames, session.Id);
        return new AuthTokens(access.Token, access.ExpiresAt, refresh.Token, refresh.ExpiresAt, MeSummary.From(user));
    }
}
