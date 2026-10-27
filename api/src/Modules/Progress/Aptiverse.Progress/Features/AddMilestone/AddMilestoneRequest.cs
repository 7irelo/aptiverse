namespace Aptiverse.Progress.Features.AddMilestone;

/// <param name="Title">3 to 120 characters.</param>
/// <param name="ThresholdValue">Above the previous milestone and below the goal target.</param>
/// <param name="Position">Optional 1 to 5; appended when absent.</param>
internal sealed record AddMilestoneRequest(string? Title, decimal ThresholdValue, int? Position);
