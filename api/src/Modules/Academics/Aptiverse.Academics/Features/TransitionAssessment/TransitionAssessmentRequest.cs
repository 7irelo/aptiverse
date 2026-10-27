namespace Aptiverse.Academics.Features.TransitionAssessment;

/// <param name="Action">
/// "start" (to in progress), "submit" (to submitted), "reopen" (back one step) or "remove_mark" (graded back to
/// submitted). A mark is recorded through recordAssessmentMark instead.
/// </param>
internal sealed record TransitionAssessmentRequest(string? Action);
