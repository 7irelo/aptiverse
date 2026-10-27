namespace Aptiverse.Progress.Features.UpdateGoal;

/// <summary>Omitted (null) fields stay as they are. No field accepts a progress value.</summary>
/// <param name="Title">3 to 120 characters.</param>
/// <param name="Description">Up to 500 characters; an empty string clears it.</param>
/// <param name="TargetValue">Same rules as on create, re-checked against a fresh baseline.</param>
/// <param name="DueAt">At least 1 day and at most a year ahead.</param>
/// <param name="SortOrder">Display order, 0 to 10000.</param>
internal sealed record UpdateGoalRequest(string? Title, string? Description, decimal? TargetValue, DateTimeOffset? DueAt, int? SortOrder);
