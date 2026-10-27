namespace Aptiverse.Identity.Features.ForgotPassword;

/// <param name="Email">The address to send the reset link to, if it has an account. Max 256 characters.</param>
internal sealed record ForgotPasswordRequest(string Email);
