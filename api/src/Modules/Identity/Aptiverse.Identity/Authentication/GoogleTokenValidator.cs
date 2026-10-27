using Aptiverse.SharedKernel.Results;
using Google.Apis.Auth;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

internal sealed record GoogleIdentity(string Subject, string Email, bool EmailVerified, string? Name);

internal interface IGoogleTokenValidator
{
    bool IsConfigured { get; }

    /// <summary>
    /// The identity in a valid Google ID token for one of our client ids; <see cref="GoogleTokenErrors.Invalid"/>
    /// for a token that fails validation and <see cref="GoogleTokenErrors.Unavailable"/> when Google cannot be reached.
    /// </summary>
    Task<Result<GoogleIdentity>> ValidateAsync(string idToken, CancellationToken cancellationToken);
}

internal static class GoogleTokenErrors
{
    public static readonly Error Invalid =
        Error.Unauthorized("identity.google_token_invalid", "Google sign-in could not be verified. Please try again.");

    public static readonly Error Unavailable =
        Error.Unavailable("identity.google_unavailable", "Google sign-in is unavailable right now. Please try again shortly or use your password.");
}

/// <summary>
/// Verifies the ID token's signature against Google's published certificates, its issuer, expiry and that
/// its audience is one of the configured client ids.
/// </summary>
internal sealed partial class GoogleTokenValidator(IOptions<AuthOptions> options, ILogger<GoogleTokenValidator> logger) : IGoogleTokenValidator
{
    public bool IsConfigured => options.Value.Google.ClientIds.Length > 0;

    public async Task<Result<GoogleIdentity>> ValidateAsync(string idToken, CancellationToken cancellationToken)
    {
        if (!IsConfigured)
        {
            return GoogleTokenErrors.Unavailable;
        }

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = options.Value.Google.ClientIds,
                IssuedAtClockTolerance = TimeSpan.FromSeconds(30),
                ExpirationTimeClockTolerance = TimeSpan.FromSeconds(30),
            });

            return string.IsNullOrWhiteSpace(payload.Subject) || string.IsNullOrWhiteSpace(payload.Email)
                ? GoogleTokenErrors.Invalid
                : new GoogleIdentity(payload.Subject, payload.Email, payload.EmailVerified, payload.Name);
        }
        catch (InvalidJwtException ex)
        {
            LogRejected(logger, ex.Message);
            return GoogleTokenErrors.Invalid;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException && !cancellationToken.IsCancellationRequested)
        {
            LogUnavailable(logger, ex);
            return GoogleTokenErrors.Unavailable;
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Rejected a Google ID token: {Reason}")]
    private static partial void LogRejected(ILogger logger, string reason);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Could not fetch Google's signing certificates")]
    private static partial void LogUnavailable(ILogger logger, Exception exception);
}
