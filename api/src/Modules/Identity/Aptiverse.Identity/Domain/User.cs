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
    public const int ProgrammeMaxLength = 160;
    public const int StudyLevelMaxLength = 24;

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

    /// <summary>Tertiary only: first_year to phd. Undergraduate years also set <see cref="YearOfStudy"/>.</summary>
    public string? StudyLevel { get; private set; }

    /// <summary>Tertiary only: the programme as the student typed it, never resolved against a list.</summary>
    public string? Programme { get; private set; }

    public string? Curriculum { get; private set; }

    public string? InstitutionName { get; private set; }

    /// <summary>Students only. Set once; a correction goes through support so a minor cannot edit past the age rules.</summary>
    public DateOnly? DateOfBirth { get; private set; }

    public DateTimeOffset? OnboardingCompletedAt { get; private set; }

    public bool EmailReminders { get; private set; } = true;

    public bool EmailProgressSummaries { get; private set; } = true;

    public bool EmailProductUpdates { get; private set; }

    public DateTimeOffset? DeletionRequestedAt { get; private set; }

    public List<UserRole> Roles { get; } = [];

    public IReadOnlyList<string> RoleNames => Roles.Select(r => r.Role).Order(StringComparer.Ordinal).ToList();

    public bool IsStudent => Roles.Any(r => r.Role == SharedKernel.Authorization.Roles.Student);

    public bool IsParent => Roles.Any(r => r.Role == SharedKernel.Authorization.Roles.Parent);

    /// <summary>Students and parents complete onboarding once; admins never do.</summary>
    public bool RequiresOnboarding => OnboardingCompletedAt is null && (IsStudent || IsParent);

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

    public void ConfirmEmail() => EmailConfirmed = true;

    /// <summary>
    /// Sets the date of birth once. Returns false when a different date is already stored; repeating the same
    /// date is accepted so a retried request is harmless.
    /// </summary>
    public bool SetDateOfBirth(DateOnly dateOfBirth)
    {
        if (DateOfBirth is { } existing)
        {
            return existing == dateOfBirth;
        }

        DateOfBirth = dateOfBirth;
        return true;
    }

    /// <summary>
    /// Chooses the student's stage. Switching clears the other stage's fields and the institution (a school and a
    /// university are different places), so the profile can never hold both shapes. Returns whether it changed.
    /// </summary>
    public bool SetEducationLevel(string educationLevel)
    {
        if (EducationLevel == educationLevel)
        {
            return false;
        }

        EducationLevel = educationLevel;
        InstitutionName = null;
        if (educationLevel == EducationLevels.HighSchool)
        {
            StudyLevel = null;
            YearOfStudy = null;
            Programme = null;
        }
        else
        {
            Grade = null;
            Curriculum = null;
        }

        return true;
    }

    /// <summary>Saves the details present for the stored stage. The caller has checked they fit the stage.</summary>
    public void SaveOnboardingDraft(OnboardingDetails details)
    {
        ArgumentNullException.ThrowIfNull(details);

        if (EducationLevel == EducationLevels.HighSchool)
        {
            Grade = details.Grade ?? Grade;
            Curriculum = details.Curriculum ?? Curriculum;
        }
        else if (EducationLevel == EducationLevels.Tertiary)
        {
            if (details.StudyLevel is not null)
            {
                StudyLevel = details.StudyLevel;
                YearOfStudy = StudyLevels.YearOf(details.StudyLevel);
            }

            Programme = Clean(details.Programme) ?? Programme;
        }

        InstitutionName = Clean(details.InstitutionName) ?? InstitutionName;
    }

    /// <summary>
    /// Completes a student's onboarding with a full profile in one call. Only the first completion sets the
    /// timestamp, so a repeated call never moves it.
    /// </summary>
    public void CompleteOnboarding(string educationLevel, OnboardingDetails details, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(details);
        SetEducationLevel(educationLevel);
        SaveOnboardingDraft(details);
        OnboardingCompletedAt ??= now;
    }

    /// <summary>Seeding shortcut kept for callers that know the year of study rather than the study level.</summary>
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
        Curriculum = highSchool ? curriculum ?? Curricula.Nsc : null;
        StudyLevel = highSchool ? null : StudyLevels.FromYear(yearOfStudy);
        YearOfStudy = highSchool || StudyLevel is null ? null : yearOfStudy;
        Programme = null;
        InstitutionName = Clean(institutionName);
        OnboardingCompletedAt ??= now;
    }

    public void CompleteParentOnboarding(DateTimeOffset now) => OnboardingCompletedAt ??= now;

    public void SetNotificationPreferences(bool reminders, bool progressSummaries, bool productUpdates)
    {
        EmailReminders = reminders;
        EmailProgressSummaries = progressSummaries;
        EmailProductUpdates = productUpdates;
    }

    public void MarkDeletionRequested(DateTimeOffset now) => DeletionRequestedAt ??= now;

    public void ClearDeletionRequest() => DeletionRequestedAt = null;

    public bool IsLockedOut(DateTimeOffset now) => LockoutEnabled && LockoutEnd is { } end && end > now;

    /// <summary>
    /// Counts a failed password check the way ASP.NET Core Identity does: at the limit the account locks for the
    /// configured time and the counter restarts. Returns true when this failure started the lockout.
    /// </summary>
    public bool RecordFailedSignIn(DateTimeOffset now, int maxFailedAttempts, TimeSpan lockoutDuration)
    {
        if (!LockoutEnabled)
        {
            return false;
        }

        AccessFailedCount++;
        if (AccessFailedCount < maxFailedAttempts)
        {
            return false;
        }

        LockoutEnd = now + lockoutDuration;
        AccessFailedCount = 0;
        return true;
    }

    public void RecordSuccessfulSignIn() => AccessFailedCount = 0;

    /// <summary>Sets a new password hash, rotates the security stamp and clears any lockout.</summary>
    public void ReplacePasswordHash(string? passwordHash)
    {
        PasswordHash = passwordHash;
        SecurityStamp = NewSecurityStamp();
        AccessFailedCount = 0;
        LockoutEnd = null;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

/// <summary>Onboarding details a student may send; null means "not provided".</summary>
internal sealed record OnboardingDetails(
    int? Grade,
    string? Curriculum,
    string? StudyLevel,
    string? Programme,
    string? InstitutionName);

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

/// <summary>Tertiary study levels, exactly the old app's list (no NQF levels).</summary>
internal static class StudyLevels
{
    public const string FirstYear = "first_year";
    public const string SecondYear = "second_year";
    public const string ThirdYear = "third_year";
    public const string FourthYear = "fourth_year";
    public const string Honours = "honours";
    public const string Masters = "masters";
    public const string Phd = "phd";

    public static IReadOnlyList<string> All { get; } = [FirstYear, SecondYear, ThirdYear, FourthYear, Honours, Masters, Phd];

    public static IReadOnlyList<string> Undergraduate { get; } = [FirstYear, SecondYear, ThirdYear, FourthYear];

    /// <summary>The undergraduate year a level stands for; null for postgraduate levels.</summary>
    public static int? YearOf(string? level) => level switch
    {
        FirstYear => 1,
        SecondYear => 2,
        ThirdYear => 3,
        FourthYear => 4,
        _ => null,
    };

    public static string? FromYear(int? year) => year switch
    {
        1 => FirstYear,
        2 => SecondYear,
        3 => ThirdYear,
        4 => FourthYear,
        _ => null,
    };
}
