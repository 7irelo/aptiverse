namespace Aptiverse.Progress.Features.GetMastery;

/// <param name="StudyUnitId">Optional: one subject or course; all of yours when absent.</param>
internal sealed record GetMasteryRequest(Guid? StudyUnitId);

/// <param name="Units">Your subjects or courses in your order.</param>
internal sealed record MasteryView(IReadOnlyList<UnitMasteryView> Units);

/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="Name">Its name.</param>
/// <param name="Score">Evidence-weighted mean of topics and marks, 0 to 1; null when there is no evidence.</param>
/// <param name="Band">"emerging", "developing", "secure" or "mastered"; null with a null score.</param>
/// <param name="EarlyRead">Fewer than 5 questions behind the score.</param>
/// <param name="EvidenceQuestions">Questions (and mark equivalents) behind the score.</param>
/// <param name="Marks">Mastery from recorded assessment marks, which carry no topic; null without marks.</param>
/// <param name="Topics">Every known topic, with or without evidence, by name.</param>
internal sealed record UnitMasteryView(
    Guid StudyUnitId,
    string Name,
    decimal? Score,
    string? Band,
    bool EarlyRead,
    int EvidenceQuestions,
    TopicMasteryItem? Marks,
    IReadOnlyList<TopicMasteryItem> Topics);

/// <param name="Topic">The topic as first written.</param>
/// <param name="Score">0 to 1; null without evidence.</param>
/// <param name="Band">Null with a null score.</param>
/// <param name="EarlyRead">Fewer than 5 questions behind the score.</param>
/// <param name="EvidenceQuestions">Questions behind the score.</param>
/// <param name="ObservationCount">Graded attempts or marks behind the score.</param>
/// <param name="LastEvidenceAt">When the latest evidence was produced.</param>
/// <param name="Trend">"up", "down" or "steady" against the previous value (a change of at least 0.05); null when unknown.</param>
internal sealed record TopicMasteryItem(
    string Topic,
    decimal? Score,
    string? Band,
    bool EarlyRead,
    int EvidenceQuestions,
    int ObservationCount,
    DateTimeOffset? LastEvidenceAt,
    string? Trend);
