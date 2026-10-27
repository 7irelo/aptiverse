namespace Aptiverse.Practice.Features.GetTestStatus;

/// <param name="TestId">The test.</param>
/// <param name="Status">"queued", "running", "ready" or "failed".</param>
/// <param name="AttemptsMade">Calls made to start the job on the ai service.</param>
/// <param name="ErrorCode">When failed: "practice.generation_failed", "practice.generation_invalid_output", "practice.generation_timed_out" or "practice.generation_cancelled".</param>
/// <param name="ReadyAt">When the test became ready.</param>
internal sealed record GenerationStatusResponse(Guid TestId, string Status, int AttemptsMade, string? ErrorCode, DateTimeOffset? ReadyAt);
