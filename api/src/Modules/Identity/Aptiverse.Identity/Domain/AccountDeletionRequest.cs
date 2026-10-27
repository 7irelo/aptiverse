using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>
/// A POPIA deletion request. It stays pending through the cooling-off period, during which the user can still sign
/// in and cancel; when the period ends it is approved and the other modules erase the user's data.
/// </summary>
internal sealed class AccountDeletionRequest : Entity
{
    public const string Pending = "pending";
    public const string Approved = "approved";
    public const string Completed = "completed";
    public const string Cancelled = "cancelled";
    public const int ReasonMaxLength = 1000;
    public const int StatusMaxLength = 16;

    private AccountDeletionRequest()
    {
    }

    public static IReadOnlyList<string> Statuses { get; } = [Pending, Approved, Completed, Cancelled];

    public Guid UserId { get; private set; }

    public string? Reason { get; private set; }

    public string Status { get; private set; } = Pending;

    public DateTimeOffset RequestedAt { get; private set; }

    public DateTimeOffset? ScheduledErasureAt { get; private set; }

    public DateTimeOffset? DecidedAt { get; private set; }

    public DateTimeOffset? CancelledAt { get; private set; }

    public static AccountDeletionRequest Create(Guid userId, string? reason, DateTimeOffset now, DateTimeOffset scheduledErasureAt) => new()
    {
        UserId = userId,
        Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim(),
        RequestedAt = now,
        ScheduledErasureAt = scheduledErasureAt,
    };

    public void Cancel(DateTimeOffset now)
    {
        if (Status == Pending)
        {
            Status = Cancelled;
            CancelledAt = now;
        }
    }

    /// <summary>The cooling-off period ended without a cancellation.</summary>
    public void Approve(DateTimeOffset now)
    {
        if (Status == Pending)
        {
            Status = Approved;
            DecidedAt = now;
        }
    }
}
