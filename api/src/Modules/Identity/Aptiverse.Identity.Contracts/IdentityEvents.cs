namespace Aptiverse.Identity.Contracts;

// Integration events published by Identity through the transactional outbox. Each carries what a subscriber
// needs (address, display name, links) so no other module ever reads identity tables.

/// <summary>A new account exists. Raised for password and Google sign-ups.</summary>
public sealed record UserRegistered(Guid UserId, string Email, string Name, string Role, DateTimeOffset OccurredAt);

/// <summary>An email verification link should be sent. The link carries a single-use token.</summary>
public sealed record EmailVerificationRequested(
    Guid UserId,
    string Email,
    string Name,
    Uri VerificationUrl,
    DateTimeOffset ExpiresAt,
    DateTimeOffset OccurredAt);

/// <summary>A password reset link should be sent. Raised only for accounts that exist.</summary>
public sealed record PasswordResetRequested(
    Guid UserId,
    string Email,
    string Name,
    Uri ResetUrl,
    DateTimeOffset ExpiresAt,
    DateTimeOffset OccurredAt);

/// <summary>The password changed (by the user or through a reset). Subscribers send a security notice.</summary>
public sealed record PasswordChanged(Guid UserId, string Email, string Name, bool ViaReset, DateTimeOffset OccurredAt);

/// <summary>The user asked for their account and personal information to be deleted (POPIA).</summary>
public sealed record AccountDeletionRequested(Guid UserId, string Email, string Name, DateTimeOffset OccurredAt);
