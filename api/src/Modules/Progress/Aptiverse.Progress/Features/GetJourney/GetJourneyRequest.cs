namespace Aptiverse.Progress.Features.GetJourney;

/// <param name="Before">The nextCursor of the previous page; omit for the newest.</param>
/// <param name="Take">1 to 50, default 20.</param>
/// <param name="Kinds">Optional comma-separated kinds: practice_completed, assessment_graded, goal_created, goal_achieved, milestone_reached, topic_band_up.</param>
internal sealed record GetJourneyRequest(string? Before, string? Kinds, int Take = GetJourneyRequest.DefaultTake)
{
    public const int DefaultTake = 20;
    public const int MaxTake = 50;
}

/// <param name="Events">Newest first.</param>
/// <param name="NextCursor">Null on the last page.</param>
internal sealed record JourneyPage(IReadOnlyList<JourneyItem> Events, string? NextCursor);

/// <param name="Kind">What happened.</param>
/// <param name="Title">A short factual line.</param>
/// <param name="Link">App-relative path, if any.</param>
/// <param name="OccurredAt">When it happened.</param>
internal sealed record JourneyItem(string Kind, string Title, string? Link, DateTimeOffset OccurredAt);
