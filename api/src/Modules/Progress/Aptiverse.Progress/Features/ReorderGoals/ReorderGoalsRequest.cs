namespace Aptiverse.Progress.Features.ReorderGoals;

/// <param name="GoalIds">Every one of your active and at-risk goals, each once, in display order.</param>
internal sealed record ReorderGoalsRequest(IReadOnlyList<Guid>? GoalIds);
