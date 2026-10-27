using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Family.Domain;

/// <summary>
/// Append-only evidence of parental consent for a minor (POPIA section 35). The current consent is the latest row per
/// student. Rows outlive links and account erasure (decision 39: kept until the retention periods are set).
/// </summary>
internal sealed class ParentalConsentRecord : Entity
{
    public const int DocumentVersionMaxLength = 20;
    public const int IpAddressMaxLength = 64;
    public const int UserAgentMaxLength = 300;

    private ParentalConsentRecord()
    {
    }

    public Guid StudentUserId { get; private set; }

    public Guid ParentUserId { get; private set; }

    public string Action { get; private set; } = ConsentActions.Granted;

    /// <summary>Who caused the row: the parent, or the system (the consenting parent's account was erased).</summary>
    public string Source { get; private set; } = ConsentRecordSources.Parent;

    public string DocumentVersion { get; private set; } = string.Empty;

    public string? IpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    public bool IsGrant => Action == ConsentActions.Granted;

    public static ParentalConsentRecord Grant(
        Guid studentUserId,
        Guid parentUserId,
        string documentVersion,
        string? ipAddress,
        string? userAgent,
        DateTimeOffset now) => new()
        {
            StudentUserId = studentUserId,
            ParentUserId = parentUserId,
            Action = ConsentActions.Granted,
            Source = ConsentRecordSources.Parent,
            DocumentVersion = documentVersion,
            IpAddress = Clip(ipAddress, IpAddressMaxLength),
            UserAgent = Clip(userAgent, UserAgentMaxLength),
            OccurredAt = now,
        };

    /// <param name="grant">The grant being withdrawn; it stays as evidence.</param>
    /// <param name="source">One of <see cref="ConsentRecordSources.All"/>.</param>
    /// <param name="now">When.</param>
    public static ParentalConsentRecord Withdraw(ParentalConsentRecord grant, string source, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(grant);
        return new()
        {
            StudentUserId = grant.StudentUserId,
            ParentUserId = grant.ParentUserId,
            Action = ConsentActions.Withdrawn,
            Source = source,
            DocumentVersion = grant.DocumentVersion,
            OccurredAt = now,
        };
    }

    private static string? Clip(string? value, int max) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Length <= max ? value : value[..max];
}
