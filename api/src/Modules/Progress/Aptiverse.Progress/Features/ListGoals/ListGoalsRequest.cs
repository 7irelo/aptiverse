namespace Aptiverse.Progress.Features.ListGoals;

/// <param name="Status">Optional: "active" (includes at risk), "achieved", "expired" or "abandoned".</param>
/// <param name="StudyUnitId">Optional: one subject or course.</param>
/// <param name="Page">1-based page.</param>
/// <param name="PageSize">1 to 50, default 20.</param>
internal sealed record ListGoalsRequest(string? Status, Guid? StudyUnitId, int Page = 1, int PageSize = ListGoalsRequest.DefaultPageSize)
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 50;
}
