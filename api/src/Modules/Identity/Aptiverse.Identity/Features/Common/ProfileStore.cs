using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.Common;

/// <summary>An onboarding or profile response plus the ETag to send back as If-Match on the next write.</summary>
internal sealed record Versioned<T>(T Value, string ETag);

/// <summary>Loads and saves the caller's own user row for the /me writes, with If-Match and xmin conflict handling.</summary>
internal sealed class ProfileStore(IDbContextOutbox<IdentityDbContext> outbox)
{
    public IdentityDbContext Db => outbox.DbContext;

    public IDbContextOutbox<IdentityDbContext> Outbox => outbox;

    /// <summary>The user, or an error: not found, or a malformed If-Match.</summary>
    public async Task<Result<User>> LoadAsync(Guid userId, string? ifMatch, CancellationToken cancellationToken)
    {
        var user = await Db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return IdentityErrors.UserNotFound;
        }

        return ETags.ApplyIfMatch(Db, user, ifMatch) ? user : IdentityErrors.ConcurrencyConflict;
    }

    public Task<bool> AdultConfirmedAsync(Guid userId, CancellationToken cancellationToken) =>
        Db.UserConsents.AnyAsync(c => c.UserId == userId && c.DocumentKey == UserConsent.AdultConfirmation && c.WithdrawnAt == null, cancellationToken);

    /// <summary>Saves the row and any queued events together; a stale If-Match or a parallel write is a 409.</summary>
    public async Task<Result> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            return Result.Success();
        }
        catch (DbUpdateConcurrencyException)
        {
            return IdentityErrors.ConcurrencyConflict;
        }
    }

    public string ETagOf(User user) => ETags.Of(Db, user);
}
