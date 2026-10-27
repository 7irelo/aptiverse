namespace Aptiverse.Identity.Contracts;

// Work messages that only the Identity module sends and handles. They live here, not in the module, because
// Wolverine handlers must be public and the architecture rules allow a public handler only for a Contracts message.
// Other modules must never send them.

/// <summary>
/// Identity only: look up an account and email it a password reset link if it exists. Deferred so the HTTP
/// response takes the same time whether or not the account exists.
/// </summary>
public sealed record IssuePasswordReset(string NormalizedEmail, string? IpAddress, string? UserAgent);

/// <summary>Identity only: email a fresh verification link if the account exists and is unverified. Deferred for the same reason.</summary>
public sealed record IssueEmailVerification(string NormalizedEmail);

/// <summary>Identity only: the cooling-off period of a deletion request ended; erase unless it was cancelled.</summary>
public sealed record ProcessScheduledErasure(Guid RequestId);
