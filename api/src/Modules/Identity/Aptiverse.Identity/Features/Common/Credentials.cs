using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Microsoft.AspNetCore.Identity;

namespace Aptiverse.Identity.Features.Common;

/// <summary>
/// Email cleaning and lookup normalisation. The stored address keeps the local part as typed and lowercases the
/// domain; lookups always go through Identity's <see cref="ILookupNormalizer"/>.
/// </summary>
internal sealed class EmailAddresses(ILookupNormalizer normalizer)
{
    public static string Clean(string email)
    {
        ArgumentNullException.ThrowIfNull(email);
        var trimmed = email.Trim();
        var at = trimmed.LastIndexOf('@');
        return at < 0 ? trimmed : string.Concat(trimmed.AsSpan(0, at + 1), trimmed[(at + 1)..].ToLowerInvariant());
    }

    public string Normalize(string email) => normalizer.NormalizeEmail(Clean(email)) ?? string.Empty;
}

/// <summary>
/// Password checks that take the same time whether or not there is a real hash to check, so response timing does
/// not reveal which emails have accounts, or which accounts sign in with Google only.
/// </summary>
internal sealed class PasswordVerifier(IPasswordHasher<User> hasher)
{
    private static readonly User DummyUser = User.Create("timing@invalid.aptiverse", "TIMING@INVALID.APTIVERSE", "Timing", emailConfirmed: false);
    private static string? _dummyHash;

    /// <summary>True when the password matches. Upgrades an old hash format in memory; the caller saves.</summary>
    public bool Verify(User user, string password)
    {
        ArgumentNullException.ThrowIfNull(user);
        if (user.PasswordHash is null)
        {
            BurnTime(password);
            return false;
        }

        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, password);
        }

        return result != PasswordVerificationResult.Failed;
    }

    /// <summary>Runs one hash verification against a throwaway hash, for paths that have no real hash to check.</summary>
    public void BurnTime(string password)
    {
        _dummyHash ??= hasher.HashPassword(DummyUser, SecureTokens.Create());
        hasher.VerifyHashedPassword(DummyUser, _dummyHash, password);
    }
}
