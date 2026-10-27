using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Practice.Domain;

/// <summary>
/// The background work of generating one test. A student has at most one queued or running job (partial unique
/// index). The ai request is built on the server when the job is created and stored, so a retried start sends the
/// exact same payload with the job id as the ai service's idempotency key.
/// </summary>
internal sealed class GenerationJob : Entity
{
    public const int StatusMaxLength = 16;
    public const int ErrorCodeMaxLength = 64;
    public const int IdempotencyKeyMaxLength = 64;
    public const int MaxAttempts = 5;

    private GenerationJob()
    {
    }

    public Guid UserId { get; private set; }

    public Guid TestId { get; private set; }

    public string Status { get; private set; } = JobStatuses.Queued;

    /// <summary>Calls made to start the job on the ai service.</summary>
    public int AttemptsMade { get; private set; }

    public DateTimeOffset? ClaimedAt { get; private set; }

    /// <summary>After this the poller stops waiting and fails the job.</summary>
    public DateTimeOffset? PollDeadlineAt { get; private set; }

    public DateTimeOffset? FinishedAt { get; private set; }

    public string? LastErrorCode { get; private set; }

    /// <summary>The ai service request as JSON (free-form AI payload, so jsonb).</summary>
    public string Request { get; private set; } = "{}";

    public string? IdempotencyKey { get; private set; }

    /// <summary>Provider cost reported by the ai service, in millionths of a US dollar.</summary>
    public long CostUsdMicros { get; private set; }

    /// <summary>The Billing quota reservation for this test; confirmed when it is ready, refunded when it fails. No FK (another module).</summary>
    public Guid? QuotaReservationId { get; private set; }

    public bool IsActive => Status is JobStatuses.Queued or JobStatuses.Running;

    public static GenerationJob Queue(Guid userId, Guid testId, string? idempotencyKey) => new()
    {
        UserId = userId,
        TestId = testId,
        Status = JobStatuses.Queued,
        IdempotencyKey = idempotencyKey,
    };

    /// <summary>Stores the ai request, which carries this job's id as the ai service's idempotency key.</summary>
    public void AttachRequest(string requestJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(requestJson);
        Request = requestJson;
    }

    public void AttachReservation(Guid reservationId) => QuotaReservationId = reservationId;

    public void MarkStarted(DateTimeOffset now, DateTimeOffset pollDeadline)
    {
        AttemptsMade = Math.Min(MaxAttempts, AttemptsMade + 1);
        Status = JobStatuses.Running;
        ClaimedAt = now;
        PollDeadlineAt = pollDeadline;
    }

    /// <summary>Counts a failed start; returns the attempts made so far.</summary>
    public int RecordStartFailure()
    {
        AttemptsMade = Math.Min(MaxAttempts, AttemptsMade + 1);
        return AttemptsMade;
    }

    public void Succeed(DateTimeOffset now, long costUsdMicros)
    {
        Status = JobStatuses.Succeeded;
        FinishedAt = now;
        LastErrorCode = null;
        CostUsdMicros = Math.Max(0, costUsdMicros);
    }

    public void Fail(string errorCode, DateTimeOffset now, long costUsdMicros = 0)
    {
        ArgumentNullException.ThrowIfNull(errorCode);
        Status = JobStatuses.Failed;
        FinishedAt = now;
        LastErrorCode = errorCode.Length <= ErrorCodeMaxLength ? errorCode : errorCode[..ErrorCodeMaxLength];
        CostUsdMicros = Math.Max(CostUsdMicros, costUsdMicros);
    }
}
