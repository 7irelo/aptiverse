namespace Aptiverse.Academics.Features.CreateAssessment;

/// <param name="EnrolmentId">One of your active enrolments.</param>
/// <param name="Title">2 to 160 characters.</param>
/// <param name="Type">One of the assessment types, for example "test", "essay" or "lab_report".</param>
/// <param name="WeightPercent">Optional, 0 to 100 with at most 2 decimals.</param>
/// <param name="Term">Optional school term 1 to 4; high school subjects only.</param>
/// <param name="DueAt">Required, with an offset; within the last 5 years and at most 2 years ahead.</param>
/// <param name="PredictedPercent">Optional, 0 to 100 with at most 2 decimals.</param>
/// <param name="Notes">Optional, at most 2000 characters.</param>
internal sealed record CreateAssessmentRequest(
    Guid EnrolmentId,
    string? Title,
    string? Type,
    decimal? WeightPercent,
    int? Term,
    DateTimeOffset? DueAt,
    decimal? PredictedPercent,
    string? Notes);
