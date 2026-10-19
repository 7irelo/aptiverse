using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Results;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// Length based password policy (NIST 800-63B style): at least 10 characters, no composition rules.
/// FluentValidation checks the shape; Identity's validators run again before a hash is stored.
/// </summary>
internal static class PasswordPolicy
{
    public const int MinLength = 10;
    public const int MaxLength = 128;

    public static IRuleBuilderOptions<T, string> Password<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().MinimumLength(MinLength).MaximumLength(MaxLength);

    public static void Configure(PasswordOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        options.RequiredLength = MinLength;
        options.RequiredUniqueChars = 1;
        options.RequireDigit = false;
        options.RequireLowercase = false;
        options.RequireUppercase = false;
        options.RequireNonAlphanumeric = false;
    }

    /// <summary>Validates <paramref name="password"/> and returns its hash, or a validation error keyed by <paramref name="field"/>.</summary>
    public static async Task<Result<string>> HashAsync(UserManager<User> users, User user, string password, string field)
    {
        ArgumentNullException.ThrowIfNull(users);

        var errors = new List<string>();
        foreach (var validator in users.PasswordValidators)
        {
            var result = await validator.ValidateAsync(users, user, password);
            errors.AddRange(result.Errors.Select(e => e.Description));
        }

        if (errors.Count > 0)
        {
            return Error.Validation(
                "identity.password_rejected",
                "The password does not meet the requirements.",
                new Dictionary<string, string[]> { [field] = [.. errors] });
        }

        return users.PasswordHasher.HashPassword(user, password);
    }
}
