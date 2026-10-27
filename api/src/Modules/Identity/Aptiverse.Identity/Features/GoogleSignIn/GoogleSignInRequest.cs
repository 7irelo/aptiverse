namespace Aptiverse.Identity.Features.GoogleSignIn;

/// <param name="IdToken">The Google ID token from Google Identity Services, max 4096 characters.</param>
internal sealed record GoogleSignInRequest(string IdToken);
