namespace Aptiverse.Academics.Features.UpdateMyUnit;

/// <summary>
/// Your own settings for an enrolment; omitted (null) fields stay as they are. The unit itself (name, code, level,
/// grade) never changes here, because shared units belong to every student in them.
/// </summary>
/// <param name="TeacherName">At most 120 characters; an empty string clears it.</param>
/// <param name="Duration">"semester" or "full_year"; university courses only.</param>
/// <param name="StartedOn">Within the last 6 years and at most 1 year ahead.</param>
/// <param name="Completed">True marks the unit finished; false reopens it.</param>
/// <param name="ColourToken">One of the unit chip colour tokens, for example "citron".</param>
/// <param name="DisplayOrder">0 to 99.</param>
internal sealed record UpdateMyUnitRequest(
    string? TeacherName,
    string? Duration,
    DateOnly? StartedOn,
    bool? Completed,
    string? ColourToken,
    int? DisplayOrder);
