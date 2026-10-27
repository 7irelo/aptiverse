namespace Aptiverse.Family.Features.UpdateSharing;

/// <summary>The full set of flags; every one is required, so a missing field never silently changes what a parent sees.</summary>
/// <param name="Academics">Subjects or courses, upcoming assessments and topic mastery.</param>
/// <param name="Practice">Practice tests completed and their scores.</param>
/// <param name="Goals">Active goals and their verified progress.</param>
/// <param name="TutorActivity">How often you used the tutor (counts only; your conversations are never shared).</param>
internal sealed record UpdateSharingRequest(bool? Academics, bool? Practice, bool? Goals, bool? TutorActivity);
