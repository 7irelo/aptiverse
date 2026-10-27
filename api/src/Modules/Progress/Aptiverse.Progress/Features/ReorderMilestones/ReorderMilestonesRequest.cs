namespace Aptiverse.Progress.Features.ReorderMilestones;

/// <param name="MilestoneIds">Every milestone of the goal, each once, in the new order.</param>
internal sealed record ReorderMilestonesRequest(IReadOnlyList<Guid>? MilestoneIds);
