using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Family.Domain;

/// <summary>
/// A short, single-use code a student hands to a parent. Split into a selector (the first characters, stored as is,
/// used to find candidate rows) and the SHA-256 of the whole code, compared in constant time. A student has at most
/// one active code: a new one replaces the old.
/// </summary>
internal sealed class LinkCode : Entity
{
    private LinkCode()
    {
    }

    public Guid StudentUserId { get; private set; }

    public string Selector { get; private set; } = string.Empty;

    public string CodeHash { get; private set; } = string.Empty;

    public string Status { get; private set; } = LinkCodeStatuses.Active;

    public DateTimeOffset ExpiresAt { get; private set; }

    public int FailedAttempts { get; private set; }

    public Guid? UsedByUserId { get; private set; }

    public DateTimeOffset? UsedAt { get; private set; }

    public bool IsActive => Status == LinkCodeStatuses.Active;

    public static LinkCode Create(Guid studentUserId, string selector, string codeHash, DateTimeOffset expiresAt) => new()
    {
        StudentUserId = studentUserId,
        Selector = selector,
        CodeHash = codeHash,
        ExpiresAt = expiresAt,
    };

    public bool IsExpired(DateTimeOffset now) => ExpiresAt <= now;

    public void Replace() => Status = LinkCodeStatuses.Replaced;

    public void Use(Guid parentUserId, DateTimeOffset now)
    {
        Status = LinkCodeStatuses.Used;
        UsedByUserId = parentUserId;
        UsedAt = now;
    }

    /// <summary>Counts a wrong guess against this code's selector and burns the code at <paramref name="maxAttempts"/>.</summary>
    public void RecordFailure(int maxAttempts)
    {
        FailedAttempts++;
        if (FailedAttempts >= maxAttempts)
        {
            Status = LinkCodeStatuses.Burned;
        }
    }
}

/// <summary>One wrong link code entered by a parent. Append-only; the redeem limit counts these per window.</summary>
internal sealed class LinkCodeFailure : Entity
{
    private LinkCodeFailure()
    {
    }

    public Guid ParentUserId { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    public static LinkCodeFailure Create(Guid parentUserId, DateTimeOffset now) => new() { ParentUserId = parentUserId, OccurredAt = now };
}
