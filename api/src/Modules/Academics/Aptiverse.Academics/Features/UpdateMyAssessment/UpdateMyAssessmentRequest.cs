namespace Aptiverse.Academics.Features.UpdateMyAssessment;

/// <summary>
/// Edits an assessment's details; omitted (null) fields stay as they are. State and marks change only through the
/// transition and mark routes. Same field rules as createAssessment.
/// </summary>
/// <param name="Title">2 to 160 characters.</param>
/// <param name="Type">One of the assessment types.</param>
/// <param name="WeightPercent">Weight toward the unit result, 0 to 100.</param>
/// <param name="Term">School term 1 to 4 (high school only).</param>
/// <param name="DueAt">When it is due, with an offset.</param>
/// <param name="PredictedPercent">Your own prediction, 0 to 100.</param>
/// <param name="Notes">At most 2000 characters; an empty string clears them.</param>
/// <param name="ClearWeightPercent">True removes the weight (do not send WeightPercent with it).</param>
/// <param name="ClearTerm">True removes the term (do not send Term with it).</param>
/// <param name="ClearPredictedPercent">True removes the prediction (do not send PredictedPercent with it).</param>
internal sealed record UpdateMyAssessmentRequest(
    string? Title,
    string? Type,
    decimal? WeightPercent,
    int? Term,
    DateTimeOffset? DueAt,
    decimal? PredictedPercent,
    string? Notes,
    bool ClearWeightPercent = false,
    bool ClearTerm = false,
    bool ClearPredictedPercent = false);
