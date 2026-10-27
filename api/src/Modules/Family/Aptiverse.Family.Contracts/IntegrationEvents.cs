namespace Aptiverse.Family.Contracts;

// Integration events published by Family through the transactional outbox, in the same transaction as the rows they
// describe. They carry ids and the few values a subscriber needs; contact details are looked up at send time.

/// <summary>
/// A parent invited a student by email. <paramref name="AcceptUrl"/> carries the single-use token and goes only into
/// the email; <paramref name="InviteeEmail"/> is personal information and must never be logged.
/// </summary>
public sealed record FamilyInviteSent(
    Guid InviteId,
    Guid InviterUserId,
    string InviteeEmail,
    string InviterDisplayName,
    string Relationship,
    Uri AcceptUrl,
    DateTimeOffset ExpiresAt,
    DateTimeOffset OccurredAt);

/// <summary>A parent and a student are now linked. Method is "invite" or "link_code".</summary>
public sealed record FamilyLinkCreated(Guid LinkId, Guid ParentUserId, Guid StudentUserId, string Method, DateTimeOffset OccurredAt);

/// <summary>A link ended. RemovedBy is "parent", "student" or "system" (account erasure).</summary>
public sealed record FamilyLinkRemoved(Guid LinkId, Guid ParentUserId, Guid StudentUserId, string RemovedBy, DateTimeOffset OccurredAt);

/// <summary>The student changed what a linked parent may see.</summary>
public sealed record FamilySharingChanged(Guid LinkId, Guid ParentUserId, Guid StudentUserId, SharingFlags Flags, DateTimeOffset OccurredAt);

/// <summary>
/// A linked, verified adult parent recorded parental consent for a student under 18 (POPIA section 35, decision 31).
/// Identity records it as the student's parental_consent document, which is what lets a minor pay.
/// </summary>
public sealed record ParentalConsentGranted(
    Guid ConsentId,
    Guid StudentUserId,
    Guid ParentUserId,
    string DocumentVersion,
    string? IpAddress,
    string? UserAgent,
    DateTimeOffset OccurredAt);

/// <summary>The consenting parent withdrew parental consent. Identity withdraws the student's parental_consent document.</summary>
public sealed record ParentalConsentWithdrawn(Guid ConsentId, Guid StudentUserId, Guid ParentUserId, DateTimeOffset OccurredAt);
