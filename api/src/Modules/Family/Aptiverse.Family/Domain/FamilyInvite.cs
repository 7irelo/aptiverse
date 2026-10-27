using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Family.Domain;

/// <summary>
/// A parent's emailed invitation to a student. Only the SHA-256 of the token is stored; the token itself exists only
/// in the email. Single use: accepting, cancelling or expiring ends it.
/// </summary>
internal sealed class FamilyInvite : Entity
{
    public const int DisplayNameMaxLength = 80;

    private FamilyInvite()
    {
    }

    public Guid InviterUserId { get; private set; }

    /// <summary>Normalised lower case. Personal information, possibly a minor's address.</summary>
    public string InviteeEmail { get; private set; } = string.Empty;

    public string InviterDisplayName { get; private set; } = string.Empty;

    public string Relationship { get; private set; } = Relationships.Guardian;

    public string TokenHash { get; private set; } = string.Empty;

    public string Status { get; private set; } = InviteStatuses.Pending;

    public DateTimeOffset ExpiresAt { get; private set; }

    public Guid? AcceptedByUserId { get; private set; }

    public DateTimeOffset? RespondedAt { get; private set; }

    public bool IsPending => Status == InviteStatuses.Pending;

    public static FamilyInvite Create(
        Guid inviterUserId,
        string inviteeEmail,
        string inviterDisplayName,
        string relationship,
        string tokenHash,
        DateTimeOffset expiresAt) => new()
        {
            InviterUserId = inviterUserId,
            InviteeEmail = inviteeEmail,
            InviterDisplayName = inviterDisplayName.Length <= DisplayNameMaxLength ? inviterDisplayName : inviterDisplayName[..DisplayNameMaxLength],
            Relationship = relationship,
            TokenHash = tokenHash,
            ExpiresAt = expiresAt,
        };

    public bool IsExpired(DateTimeOffset now) => ExpiresAt <= now;

    /// <summary>The status a reader should see: a pending invite past its expiry reads as expired.</summary>
    public string EffectiveStatus(DateTimeOffset now) => IsPending && IsExpired(now) ? InviteStatuses.Expired : Status;

    public void Accept(Guid studentUserId, DateTimeOffset now)
    {
        Status = InviteStatuses.Accepted;
        AcceptedByUserId = studentUserId;
        RespondedAt = now;
    }

    public void Cancel(DateTimeOffset now)
    {
        Status = InviteStatuses.Cancelled;
        RespondedAt = now;
    }

    public void Expire() => Status = InviteStatuses.Expired;
}
