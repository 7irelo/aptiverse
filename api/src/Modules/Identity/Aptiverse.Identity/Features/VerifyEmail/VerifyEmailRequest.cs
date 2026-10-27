namespace Aptiverse.Identity.Features.VerifyEmail;

/// <param name="Token">The token from the emailed link: 43 base64url characters.</param>
internal sealed record VerifyEmailRequest(string Token);
