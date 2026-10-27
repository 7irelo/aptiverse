namespace Aptiverse.Identity.Features.ResendVerification;

/// <param name="Email">Required when signed out; when signed in and omitted, the current account's address is used.</param>
internal sealed record ResendVerificationRequest(string? Email = null);
