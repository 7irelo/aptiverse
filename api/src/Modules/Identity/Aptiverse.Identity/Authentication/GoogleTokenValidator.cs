using Google.Apis.Auth;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

internal sealed record GoogleIdentity(string Subject, string Email, bool EmailVerified, string? Name);

internal interface IGoogleTokenValidator
{
    bool IsConfigured { get; }

    /// <summary>Returns the identity in a valid Google ID token for one of our client ids, otherwise null.</summary>
    Task<GoogleIdentity?> ValidateAsync(string idToken, CancellationToken cancellationToken);
}

/// <summary>
/// Verifies the ID token's signature against Google's published certificates, its issuer, expiry and that
/// its audience is one of the configured client ids.
/// </summary>
internal sealed class GoogleTokenValidator(IOptions<AuthOptions> options, ILogger<GoogleTokenValidator> logger) : IGoogleTokenValidator
{
    public bool IsConfigured => options.Value.Google.ClientIds.Length > 0;

    public async Task<GoogleIdentity?> ValidateAsync(string idToken, CancellationToken cancellationToken)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = options.Value.Google.ClientIds,
                IssuedAtClockTolerance = TimeSpan.FromSeconds(30),
                ExpirationTimeClockTolerance = TimeSpan.FromSeconds(30),
            });

            return string.IsNullOrWhiteSpace(payload.Subject) || string.IsNullOrWhiteSpace(payload.Email)
                ? null
                : new GoogleIdentity(payload.Subject, payload.Email, payload.EmailVerified, payload.Name);
        }
        catch (InvalidJwtException ex)
        {
            logger.LogInformation("Rejected a Google ID token: {Reason}", ex.Message);
            return null;
        }
    }
}
