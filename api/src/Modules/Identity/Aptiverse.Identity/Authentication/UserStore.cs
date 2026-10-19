using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// ASP.NET Core Identity store over the module's own <see cref="User"/> entity, so users live in the identity
/// schema with Guid v7 ids, soft delete and xmin like every other table. It backs UserManager and
/// SignInManager (password hashing, lockout); roles, logins and tokens are handled by the module directly.
/// </summary>
internal sealed class UserStore(IdentityDbContext db) :
    IUserPasswordStore<User>,
    IUserEmailStore<User>,
    IUserSecurityStampStore<User>,
    IUserLockoutStore<User>
{
    public Task<string> GetUserIdAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.Id.ToString());

    public Task<string?> GetUserNameAsync(User user, CancellationToken cancellationToken) => Task.FromResult<string?>(user.Email);

    public Task SetUserNameAsync(User user, string? userName, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task<string?> GetNormalizedUserNameAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.NormalizedEmail);

    public Task SetNormalizedUserNameAsync(User user, string? normalizedName, CancellationToken cancellationToken) => Task.CompletedTask;

    public async Task<IdentityResult> CreateAsync(User user, CancellationToken cancellationToken)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> UpdateAsync(User user, CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return IdentityResult.Success;
        }
        catch (DbUpdateConcurrencyException)
        {
            return IdentityResult.Failed(new IdentityErrorDescriber().ConcurrencyFailure());
        }
    }

    public async Task<IdentityResult> DeleteAsync(User user, CancellationToken cancellationToken)
    {
        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<User?> FindByIdAsync(string userId, CancellationToken cancellationToken) =>
        Guid.TryParse(userId, out var id)
            ? await db.Users.SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
            : null;

    public Task<User?> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken) =>
        FindByEmailAsync(normalizedUserName, cancellationToken);

    public Task SetPasswordHashAsync(User user, string? passwordHash, CancellationToken cancellationToken)
    {
        user.PasswordHash = passwordHash;
        return Task.CompletedTask;
    }

    public Task<string?> GetPasswordHashAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.PasswordHash);

    public Task<bool> HasPasswordAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.PasswordHash is not null);

    public Task SetEmailAsync(User user, string? email, CancellationToken cancellationToken)
    {
        user.Email = email ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task<string?> GetEmailAsync(User user, CancellationToken cancellationToken) => Task.FromResult<string?>(user.Email);

    public Task<bool> GetEmailConfirmedAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.EmailConfirmed);

    public Task SetEmailConfirmedAsync(User user, bool confirmed, CancellationToken cancellationToken)
    {
        user.EmailConfirmed = confirmed;
        return Task.CompletedTask;
    }

    public Task<User?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        db.Users.SingleOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

    public Task<string?> GetNormalizedEmailAsync(User user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.NormalizedEmail);

    public Task SetNormalizedEmailAsync(User user, string? normalizedEmail, CancellationToken cancellationToken)
    {
        user.NormalizedEmail = normalizedEmail ?? string.Empty;
        return Task.CompletedTask;
    }

    public Task SetSecurityStampAsync(User user, string stamp, CancellationToken cancellationToken)
    {
        user.SecurityStamp = stamp;
        return Task.CompletedTask;
    }

    public Task<string?> GetSecurityStampAsync(User user, CancellationToken cancellationToken) => Task.FromResult<string?>(user.SecurityStamp);

    public Task<DateTimeOffset?> GetLockoutEndDateAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.LockoutEnd);

    public Task SetLockoutEndDateAsync(User user, DateTimeOffset? lockoutEnd, CancellationToken cancellationToken)
    {
        user.LockoutEnd = lockoutEnd;
        return Task.CompletedTask;
    }

    public Task<int> IncrementAccessFailedCountAsync(User user, CancellationToken cancellationToken)
    {
        user.AccessFailedCount++;
        return Task.FromResult(user.AccessFailedCount);
    }

    public Task ResetAccessFailedCountAsync(User user, CancellationToken cancellationToken)
    {
        user.AccessFailedCount = 0;
        return Task.CompletedTask;
    }

    public Task<int> GetAccessFailedCountAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.AccessFailedCount);

    public Task<bool> GetLockoutEnabledAsync(User user, CancellationToken cancellationToken) => Task.FromResult(user.LockoutEnabled);

    public Task SetLockoutEnabledAsync(User user, bool enabled, CancellationToken cancellationToken)
    {
        user.LockoutEnabled = enabled;
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        // The DbContext is owned by the DI scope.
    }
}
