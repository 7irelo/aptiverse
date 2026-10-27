namespace Aptiverse.Progress.Features.UpdateMilestone;

/// <param name="Title">3 to 120 characters.</param>
/// <param name="ThresholdValue">Same ordering rules as on add.</param>
internal sealed record UpdateMilestoneRequest(string? Title, decimal? ThresholdValue);
