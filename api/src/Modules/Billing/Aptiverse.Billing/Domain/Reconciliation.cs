using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Billing.Domain;

/// <summary>One comparison of Paystack's transaction list with the local payments. Scheduled runs are unique per day.</summary>
internal sealed class ReconciliationRun : Entity
{
    private ReconciliationRun()
    {
    }

    public DateTimeOffset WindowFrom { get; private set; }

    public DateTimeOffset WindowTo { get; private set; }

    public string Trigger { get; private set; } = RunTriggers.Admin;

    public DateOnly? ScheduledFor { get; private set; }

    public string Status { get; private set; } = RunStatuses.Running;

    public int CheckedCount { get; private set; }

    public int DriftCount { get; private set; }

    public DateTimeOffset? FinishedAt { get; private set; }

    public static ReconciliationRun Start(DateTimeOffset from, DateTimeOffset to, string trigger, DateOnly? scheduledFor) => new()
    {
        WindowFrom = from,
        WindowTo = to,
        Trigger = trigger,
        ScheduledFor = scheduledFor,
        Status = RunStatuses.Running,
    };

    public void Finish(int checkedCount, int driftCount, DateTimeOffset now)
    {
        Status = RunStatuses.Succeeded;
        CheckedCount = checkedCount;
        DriftCount = driftCount;
        FinishedAt = now;
    }

    public void Fail(DateTimeOffset now)
    {
        Status = RunStatuses.Failed;
        FinishedAt = now;
    }
}

/// <summary>A mismatch to look at. Raised by a reconciliation run, or by the inbox when a charge cannot be applied safely.</summary>
internal sealed class ReconciliationDrift : Entity
{
    public const int KindMaxLength = 40;
    public const int RefMaxLength = 100;
    public const int ValueMaxLength = 200;

    private ReconciliationDrift()
    {
    }

    public Guid? RunId { get; private set; }

    public string Kind { get; private set; } = string.Empty;

    public string? PaystackRef { get; private set; }

    public Guid? LocalId { get; private set; }

    public string? Expected { get; private set; }

    public string? Actual { get; private set; }

    public DateTimeOffset? ResolvedAt { get; private set; }

    public string? Resolution { get; private set; }

    public static ReconciliationDrift Raise(Guid? runId, string kind, string? paystackRef, Guid? localId, string? expected, string? actual) => new()
    {
        RunId = runId,
        Kind = kind,
        PaystackRef = Clip(paystackRef, RefMaxLength),
        LocalId = localId,
        Expected = Clip(expected, ValueMaxLength),
        Actual = Clip(actual, ValueMaxLength),
    };

    private static string? Clip(string? text, int max) => text is { Length: > 0 } && text.Length > max ? text[..max] : text;
}
