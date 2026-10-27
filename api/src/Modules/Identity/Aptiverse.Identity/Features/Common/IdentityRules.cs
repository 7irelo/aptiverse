using System.Text.RegularExpressions;
using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Identity.Features.Common;

/// <summary>Field rules shared by the Identity validators, so every endpoint accepts the same shapes.</summary>
internal static partial class IdentityRules
{
    public const int NameMinLength = 2;
    public const int MinimumAge = 10;
    public const int MaximumAge = 80;
    public const int GoogleTokenMaxLength = 4096;
    public const int ConsentVersionMaxLength = UserConsent.DocumentVersionMaxLength;

    /// <summary>Trimmed 2 to 120 characters, no control characters, and at least one letter.</summary>
    public static IRuleBuilderOptions<T, string?> PersonName<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(IsValidName)
            .WithMessage($"Enter a name of {NameMinLength} to {User.NameMaxLength} characters that includes letters.");

    /// <summary>Max 256, a valid address with exactly one @ and a dot in the domain.</summary>
    public static IRuleBuilderOptions<T, string?> AccountEmail<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(IsValidEmail).WithMessage("Enter a valid email address.");

    public static IRuleBuilderOptions<T, string?> OneTimeToken<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(SecureTokens.IsWellFormed).WithMessage("The link is incomplete. Open it from the email again.");

    public static IRuleBuilderOptions<T, string?> PhoneNumber<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(p => p is null || E164().IsMatch(p.Trim()))
            .WithMessage("Enter the number in international format, for example +27821234567.");

    public static IRuleBuilderOptions<T, string?> InstitutionName<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(v => v is null || IsPlainText(v, 2, User.InstitutionMaxLength))
            .WithMessage($"Enter 2 to {User.InstitutionMaxLength} characters.");

    public static IRuleBuilderOptions<T, string?> Programme<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(v => v is null || IsPlainText(v, 2, User.ProgrammeMaxLength))
            .WithMessage($"Enter 2 to {User.ProgrammeMaxLength} characters.");

    /// <summary>Age 10 to 80 on today's Johannesburg date.</summary>
    public static IRuleBuilderOptions<T, DateOnly?> DateOfBirth<T>(this IRuleBuilder<T, DateOnly?> rule, IClock clock) =>
        rule.Must(d => d is null || Ages.AgeOn(d.Value, Ages.Today(clock)) is >= MinimumAge and <= MaximumAge)
            .WithMessage($"Enter a date of birth for an age between {MinimumAge} and {MaximumAge}.");

    public static bool IsValidName(string? name)
    {
        if (name is null)
        {
            return false;
        }

        var trimmed = name.Trim();
        return trimmed.Length >= NameMinLength
            && trimmed.Length <= User.NameMaxLength
            && !trimmed.Any(char.IsControl)
            && trimmed.Any(char.IsLetter);
    }

    public static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var trimmed = email.Trim();
        var at = trimmed.IndexOf('@', StringComparison.Ordinal);
        if (trimmed.Length > User.EmailMaxLength || at <= 0 || at != trimmed.LastIndexOf('@') || trimmed.Any(c => char.IsWhiteSpace(c) || char.IsControl(c)))
        {
            return false;
        }

        var domain = trimmed[(at + 1)..];
        var dot = domain.IndexOf('.', StringComparison.Ordinal);
        return dot > 0 && dot < domain.Length - 1 && !domain.Contains("..", StringComparison.Ordinal);
    }

    private static bool IsPlainText(string value, int min, int max)
    {
        var trimmed = value.Trim();
        return trimmed.Length >= min && trimmed.Length <= max && !trimmed.Any(char.IsControl);
    }

    [GeneratedRegex(@"^\+[1-9]\d{7,14}$")]
    private static partial Regex E164();
}

/// <summary>
/// Age facts from a date of birth on today's Johannesburg date. Other modules only ever see the band or the
/// minor flag, never the date.
/// </summary>
internal static class Ages
{
    public const string Under13 = "under_13";
    public const string Teen = "13_to_17";
    public const string Adult = "18_plus";
    public const string Unknown = "unknown";

    private static readonly TimeZoneInfo Johannesburg = TimeZoneInfo.FindSystemTimeZoneById("Africa/Johannesburg");

    public static DateOnly Today(IClock clock)
    {
        ArgumentNullException.ThrowIfNull(clock);
        return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(clock.UtcNow, Johannesburg).DateTime);
    }

    public static int AgeOn(DateOnly dateOfBirth, DateOnly today)
    {
        var age = today.Year - dateOfBirth.Year;
        return dateOfBirth > today.AddYears(-age) ? age - 1 : age;
    }

    public static string Band(DateOnly? dateOfBirth, DateOnly today) => dateOfBirth is { } dob
        ? AgeOn(dob, today) switch
        {
            < 13 => Under13,
            < 18 => Teen,
            _ => Adult,
        }
        : Unknown;

    /// <summary>
    /// Students: from the date of birth, null while it is unknown. Parents confirmed they are adults; other
    /// accounts are adults by construction.
    /// </summary>
    public static bool? IsMinor(User user, DateOnly today)
    {
        ArgumentNullException.ThrowIfNull(user);
        if (!user.IsStudent)
        {
            return false;
        }

        return user.DateOfBirth is { } dob ? AgeOn(dob, today) < 18 : null;
    }
}
