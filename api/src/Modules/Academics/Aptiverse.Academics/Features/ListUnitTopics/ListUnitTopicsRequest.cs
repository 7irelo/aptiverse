namespace Aptiverse.Academics.Features.ListUnitTopics;

/// <param name="Q">Optional name filter, 1 to 60 characters.</param>
/// <param name="Limit">1 to 200, default 100.</param>
internal sealed record ListUnitTopicsRequest(string? Q, int Limit = 100);

/// <summary>A canonical topic. Topics are shared across students of a shared unit and never say who added them.</summary>
internal sealed record TopicView(Guid Id, string Name, string Slug);
