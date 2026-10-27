namespace Aptiverse.Family.Contracts;

/// <summary>Who is linked to whom, for other modules (Billing seats, later Wellbeing). Only active links count.</summary>
public interface IFamilyLinkLookup
{
    Task<bool> IsLinkedAsync(Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken);

    /// <summary>The parent's actively linked students, oldest link first.</summary>
    Task<IReadOnlyList<Guid>> GetChildrenAsync(Guid parentUserId, CancellationToken cancellationToken);

    /// <summary>What the student shares with this parent; null when there is no active link.</summary>
    Task<SharingFlags?> GetSharingAsync(Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken);
}

/// <param name="Academics">Subjects or courses, upcoming assessments and topic mastery.</param>
/// <param name="Practice">Practice tests completed and their scores.</param>
/// <param name="Goals">Active goals and their verified progress.</param>
/// <param name="TutorActivity">How often the tutor was used (counts only; conversation content is never shared).</param>
public sealed record SharingFlags(bool Academics, bool Practice, bool Goals, bool TutorActivity);
