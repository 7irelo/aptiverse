using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>Evidence that a user accepted a specific version of a legal document. Append-only.</summary>
internal sealed class UserConsent : Entity
{
    public const string Terms = "terms";
    public const string Privacy = "privacy";
    public const int DocumentKeyMaxLength = 32;
    public const int DocumentVersionMaxLength = 32;
    public const int SourceMaxLength = 32;

    private UserConsent()
    {
    }

    public Guid UserId { get; private set; }

    public string DocumentKey { get; private set; } = string.Empty;

    /// <summary>Not named Version: that name is the xmin concurrency token every entity carries.</summary>
    public string DocumentVersion { get; private set; } = string.Empty;

    public DateTimeOffset AcceptedAt { get; private set; }

    public string Source { get; private set; } = string.Empty;

    public string? IpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public static UserConsent Create(Guid userId, string documentKey, string version, string source, RequestInfo request, DateTimeOffset now) => new()
    {
        UserId = userId,
        DocumentKey = documentKey,
        DocumentVersion = version,
        Source = source,
        AcceptedAt = now,
        IpAddress = request.IpAddress,
        UserAgent = request.UserAgent,
    };
}
