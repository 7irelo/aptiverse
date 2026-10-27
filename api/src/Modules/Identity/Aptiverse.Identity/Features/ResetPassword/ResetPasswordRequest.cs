namespace Aptiverse.Identity.Features.ResetPassword;

/// <param name="Token">The token from the emailed link: 43 base64url characters.</param>
/// <param name="NewPassword">10 to 128 characters, no composition rules.</param>
internal sealed record ResetPasswordRequest(string Token, string NewPassword);
