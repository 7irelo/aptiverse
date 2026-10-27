using Aptiverse.Family.Contracts;
using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Family.Domain;

/// <summary>
/// A parent linked to a student. Created only by the student's action (accepting an invite or handing over a code),
/// so the student consents to every link. The sharing flags belong to the student; a parent can never change them.
/// </summary>
internal sealed class FamilyLink : Entity
{
    private FamilyLink()
    {
    }

    public Guid ParentUserId { get; private set; }

    public Guid StudentUserId { get; private set; }

    public string Status { get; private set; } = LinkStatuses.Active;

    public string Relationship { get; private set; } = Relationships.Guardian;

    public string Method { get; private set; } = LinkMethods.Invite;

    /// <summary>The invite or link code that created the link.</summary>
    public Guid SourceId { get; private set; }

    public bool ShareAcademics { get; private set; } = true;

    public bool SharePractice { get; private set; } = true;

    public bool ShareGoals { get; private set; } = true;

    /// <summary>Off by default: tutor use is closer to private study than marks are. Only counts are ever shared.</summary>
    public bool ShareTutorActivity { get; private set; }

    public DateTimeOffset LinkedAt { get; private set; }

    public DateTimeOffset SharingChangedAt { get; private set; }

    public DateTimeOffset? RemovedAt { get; private set; }

    public string? RemovedByRole { get; private set; }

    public bool IsActive => Status == LinkStatuses.Active;

    public SharingFlags Sharing => new(ShareAcademics, SharePractice, ShareGoals, ShareTutorActivity);

    public static FamilyLink Create(Guid parentUserId, Guid studentUserId, string relationship, string method, Guid sourceId, DateTimeOffset now) => new()
    {
        ParentUserId = parentUserId,
        StudentUserId = studentUserId,
        Relationship = relationship,
        Method = method,
        SourceId = sourceId,
        LinkedAt = now,
        SharingChangedAt = now,
    };

    /// <summary>Returns true when any flag changed.</summary>
    public bool SetSharing(SharingFlags flags, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(flags);
        if (flags == Sharing)
        {
            return false;
        }

        ShareAcademics = flags.Academics;
        SharePractice = flags.Practice;
        ShareGoals = flags.Goals;
        ShareTutorActivity = flags.TutorActivity;
        SharingChangedAt = now;
        return true;
    }

    /// <summary>Returns false when the link was already removed.</summary>
    public bool Remove(string removedBy, DateTimeOffset now)
    {
        if (!IsActive)
        {
            return false;
        }

        Status = LinkStatuses.Removed;
        RemovedAt = now;
        RemovedByRole = removedBy;
        return true;
    }
}
