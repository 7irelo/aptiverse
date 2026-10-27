namespace Aptiverse.Identity.Features.RequestAccountDeletion;

/// <param name="Confirm">Must be the literal text DELETE.</param>
/// <param name="CurrentPassword">Required for accounts with a password.</param>
/// <param name="Reason">Optional, up to 1000 characters.</param>
internal sealed record RequestAccountDeletionRequest(string Confirm, string? CurrentPassword = null, string? Reason = null);
