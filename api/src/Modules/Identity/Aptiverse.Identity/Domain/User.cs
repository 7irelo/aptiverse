using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>
/// An account. Password, security stamp and lockout fields are owned by ASP.NET Core Identity through
/// <see cref="Authentication.UserStore"/>; everything else changes through the methods below.
/// </summary>
internal sealed class User : Entity
{
    public const int EmailMaxLength = 256;
    public const int NameMaxLength = 120;
    public const int PhoneMaxLength = 32;
    public const int InstitutionMaxLength = 200;

    private User()
    {
    }

    public string Email { get; set; } = string.Empty;

    public string NormalizedEmail { get; set; } = string.Empty;

    public bool EmailConfirmed { get; set; }

    public string? PasswordHash { get; set; }

    public string SecurityStamp { get; set; } = string.Empty;

    public bool LockoutEnabled { get; set; }

    public DateTimeOffset? LockoutEnd { get; set; }

    public int AccessFailedCount { get; set; }

    public string Name { get; private set; } = string.Empty;

    public string? PhoneNumber { get; private set; }

    public string? EducationLevel { get; private set; }

    public int? Grade { get; private set; }

    public int? YearOfStudy { get; private set; }

    public string? Curriculum { get; private set; }

    public string? InstitutionName { get; private set; }

    public DateTimeOffset? OnboardingCompletedAt { get; private set; }

    public bool EmailReminders { get; private set; } = true;

    public bool EmailProgressSummaries { get; private set; } = true;

    public bool EmailProductUpdates { get; private set; }

    public DateTimeOffset? DeletionRequestedAt { get; private set; }

    public List<UserRole> Roles { get; } = [];

    public IReadOnlyList<string> RoleNames => Roles.Select(r => r.Role).Order(StringComparer.Ordinal).ToList();

    /// <summary>Onboarding (education level, grade or year) applies to students only.</summary>
    public bool RequiresOnboarding => Roles.Any(r => r.Role == SharedKernel.Authorization.Roles.Student);

    public static User Create(string email, string normalizedEmail, string name, bool emailConfirmed) => new()
    {
        Email = email.Trim(),
        NormalizedEmail = normalizedEmail,
        Name = name.Trim(),
        EmailConfirmed = emailConfirmed,
        LockoutEnabled = true,
        SecurityStamp = NewSecurityStamp(),
    };

    public static string NewSecurityStamp() => Guid.NewGuid().ToString("N");

    public void AddRole(string role)
    {
        if (Roles.All(r => r.Role != role))
        {
            Roles.Add(UserRole.Create(Id, role));
        }
    }

    public void UpdateProfile(string name, string? phoneNumber)
    {
        Name = name.Trim();
        PhoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? null : phoneNumber.Trim();
    }

    public void CompleteOnboarding(
        string educationLevel,
        int? grade,
        int? yearOfStudy,
        string? curriculum,
        string? institutionName,
        DateTimeOffset now)
    {
        var highSchool = educationLevel == EducationLevels.HighSchool;
        EducationLevel = educationLevel;
        Grade = highSchool ? grade : null;
        YearOfStudy = highSchool ? null : yearOfStudy;
        Curriculum = highSchool ? curriculum ?? Curricula.Nsc : null;
        InstitutionName = string.IsNullOrWhiteSpace(institutionName) ? null : institutionName.Trim();
        OnboardingCompletedAt ??= now;
    }

    public void SetNotificationPreferences(bool reminders, bool progressSummaries, bool productUpdates)
    {
        EmailReminders = reminders;
        EmailProgressSummaries = progressSummaries;
        EmailProductUpdates = productUpdates;
    }

    public void MarkDeletionRequested(DateTimeOffset now) => DeletionRequestedAt ??= now;

    public bool IsLockedOut(DateTimeOffset now) => LockoutEnabled && LockoutEnd is { } end && end > now;

    /// <summary>Sets a new password hash, rotates the security stamp and clears any lockout.</summary>
    public void ReplacePasswordHash(string? passwordHash)
    {
        PasswordHash = passwordHash;
        SecurityStamp = NewSecurityStamp();
        AccessFailedCount = 0;
        LockoutEnd = null;
    }
}

internal static class EducationLevels
{
    public const string HighSchool = "high_school";
    public const string Tertiary = "tertiary";

    public static IReadOnlyList<string> All { get; } = [HighSchool, Tertiary];
}

/// <summary>
/// The exam body a high school student writes, not the curriculum: both follow CAPS (decision 29).
/// </summary>
internal static class Curricula
{
    public const string Nsc = "nsc";
    public const string Ieb = "ieb";

    public static IReadOnlyList<string> All { get; } = [Nsc, Ieb];
}
