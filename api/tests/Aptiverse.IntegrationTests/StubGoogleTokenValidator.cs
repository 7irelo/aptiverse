using Aptiverse.Identity.Authentication;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// Fake Google validation. A token "google|subject|email|verified" or "google|subject|email|unverified" is valid for
/// that identity; "down" means Google cannot be reached; anything else is an invalid token.
/// </summary>
internal sealed class StubGoogleTokenValidator : IGoogleTokenValidator
{
    public bool IsConfigured => true;

    public static string Token(string subject, string email, bool verified = true) =>
        $"google|{subject}|{email}|{(verified ? "verified" : "unverified")}";

    public Task<Result<GoogleIdentity>> ValidateAsync(string idToken, CancellationToken cancellationToken)
    {
        if (idToken == "down")
        {
            return Task.FromResult(Result<GoogleIdentity>.Failure(GoogleTokenErrors.Unavailable));
        }

        var parts = idToken.Split('|');
        return Task.FromResult(parts is ["google", var subject, var email, var verified]
            ? Result<GoogleIdentity>.Success(new GoogleIdentity(subject, email, verified == "verified", "Google User"))
            : Result<GoogleIdentity>.Failure(GoogleTokenErrors.Invalid));
    }
}
