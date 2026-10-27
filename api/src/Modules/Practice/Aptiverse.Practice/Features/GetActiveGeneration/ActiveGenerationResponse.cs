namespace Aptiverse.Practice.Features.GetActiveGeneration;

/// <param name="JobId">The generation job.</param>
/// <param name="TestId">The test being generated.</param>
/// <param name="AssessmentId">The assessment it is for.</param>
/// <param name="Format">The test format.</param>
/// <param name="Status">"queued" or "running".</param>
/// <param name="StartedAt">When it was requested.</param>
internal sealed record ActiveGenerationResponse(Guid JobId, Guid TestId, Guid AssessmentId, string Format, string Status, DateTimeOffset StartedAt);
