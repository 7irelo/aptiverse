using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>
/// Evidence that a user accepted a specific version of a legal document. Append-only: the only change ever made
/// is withdrawing an optional consent (marketing); terms and privacy are never withdrawn, the account is deleted instead.
/// </summary>
internal sealed class UserConsent : Entity
{
    public const string Terms = "terms";
    public const string Privacy = "privacy";
    public const string MarketingEmail = "marketing_email";
    public const string AdultConfirmation = "adult_confirmation";

    /// <summary>Marketing and adult confirmation are not versioned legal documents; they carry this fixed version.</summary>
    public const string UnversionedDocument = "1";

    public const int DocumentKeyMaxLength = 32;
    public const int DocumentVersionMaxLength = 32;
    public const int SourceMaxLength = 32;

    private UserConsent()
    {
    }

    public static IReadOnlyList<string> DocumentKeys { get; } = [Terms, Privacy, MarketingEmail, AdultConfirmation];

    public Guid UserId { get; private set; }

    public string DocumentKey { get; private set; } = string.Empty;

    /// <summary>Not named Version: that name is the xmin concurrency token every entity carries.</summary>
    public string DocumentVersion { get; private set; } = string.Empty;

    public DateTimeOffset AcceptedAt { get; private set; }

    public string Source { get; private set; } = string.Empty;

    public string? IpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public DateTimeOffset? WithdrawnAt { get; private set; }

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

    public void Withdraw(DateTimeOffset now) => WithdrawnAt ??= now;
}

internal static class ConsentSources
{
    public const string Register = "register";
    public const string Google = "google";
    public const string Reconsent = "reconsent";
    public const string Migration = "migration";
    public const string Onboarding = "onboarding";
    public const string Profile = "profile";

    public static IReadOnlyList<string> All { get; } = [Register, Google, Reconsent, Migration, Onboarding, Profile];
}
