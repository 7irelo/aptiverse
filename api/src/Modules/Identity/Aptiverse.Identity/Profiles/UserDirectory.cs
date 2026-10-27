using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Profiles;

/// <summary>Reads the contact fields of one user row. Soft-deleted (erased) accounts are hidden by the query filter.</summary>
internal sealed class UserDirectory(IdentityDbContext db) : IUserDirectory
{
    public async Task<UserContact?> GetContactAsync(Guid userId, CancellationToken cancellationToken)
    {
        var row = await db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.Email, u.Name, u.EmailConfirmed, Roles = u.Roles.Select(r => r.Role).ToList() })
            .SingleOrDefaultAsync(cancellationToken);

        return row is null
            ? null
            : new UserContact(userId, row.Email, row.Name, row.EmailConfirmed, row.Roles.Order(StringComparer.Ordinal).ToList());
    }
}
