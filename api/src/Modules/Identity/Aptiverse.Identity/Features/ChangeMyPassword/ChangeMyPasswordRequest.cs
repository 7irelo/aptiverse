namespace Aptiverse.Identity.Features.ChangeMyPassword;

/// <param name="CurrentPassword">Required when the account has a password; Google-only accounts set a first password without it.</param>
/// <param name="NewPassword">10 to 128 characters, no composition rules, different from the current one.</param>
internal sealed record ChangeMyPasswordRequest(string? CurrentPassword, string NewPassword);
