using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.RequestAccountDeletion;

/// <param name="RequestId">The pending request; cancel it with cancelAccountDeletion before scheduledErasureAt.</param>
/// <param name="RequestedAt">When deletion was requested.</param>
/// <param name="ScheduledErasureAt">When erasure starts unless cancelled: the request time plus the 14 day cooling-off period.</param>
internal sealed record AccountDeletionResponse(Guid RequestId, DateTimeOffset RequestedAt, DateTimeOffset ScheduledErasureAt);

/// <summary>
/// Records a POPIA deletion request and schedules erasure for the end of the cooling-off period (decision 38). The
/// user can still sign in and cancel until then. When the period ends, <see cref="Messaging.ScheduledErasureProcessor"/>
/// publishes AccountDeletionRequested and every module erases the user's rows. One pending request per user.
/// </summary>
internal sealed partial class RequestAccountDeletionHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    PasswordVerifier passwords,
    IOptions<AuthOptions> auth,
    IOptions<IdentityOptions> identity,
    IClock clock,
    ILogger<RequestAccountDeletionHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    /// <summary>The response, and whether it is a new request (202) or the existing pending one (200).</summary>
    public async Task<Result<(AccountDeletionResponse Response, bool Created)>> HandleAsync(
        Guid userId,
        RequestAccountDeletionRequest request,
        RequestInfo origin,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var user = await Db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return IdentityErrors.UserNotFound;
        }

        var now = clock.UtcNow;
        if (user.IsLockedOut(now))
        {
            return AuthRateLimiting.TooManyAttempts(user.LockoutEnd!.Value - now);
        }

        if (user.PasswordHash is not null && (string.IsNullOrEmpty(request.CurrentPassword) || !passwords.Verify(user, request.CurrentPassword)))
        {
            var lockout = identity.Value.Lockout;
            var lockedNow = user.RecordFailedSignIn(now, lockout.MaxFailedAccessAttempts, lockout.DefaultLockoutTimeSpan);
            Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginFailed, user.Id, null, origin, "Wrong password on deletion request."));
            await SaveIgnoringRacesAsync(cancellationToken);
            return lockedNow ? AuthRateLimiting.TooManyAttempts(user.LockoutEnd!.Value - now) : IdentityErrors.InvalidCredentials;
        }

        if (await PendingAsync(userId, cancellationToken) is { } existing)
        {
            return (existing, false);
        }

        var scheduled = now.AddDays(auth.Value.DeletionCoolingOffDays);
        var deletion = AccountDeletionRequest.Create(user.Id, request.Reason, now, scheduled);
        Db.AccountDeletionRequests.Add(deletion);
        user.MarkDeletionRequested(now);
        Db.SecurityEvents.Add(SecurityEvent.Create(
            SecurityEventTypes.AccountDeletionRequested, user.Id, null, origin, $"Erasure scheduled for {scheduled:O}."));
        await outbox.ScheduleAsync(new ProcessScheduledErasure(deletion.Id), scheduled);

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // A parallel request from another device created the pending request first.
            Db.ChangeTracker.Clear();
            return await PendingAsync(userId, cancellationToken) is { } raced ? (raced, false) : IdentityErrors.ConcurrencyConflict;
        }

        IdentityMetrics.DeletionRequested();
        LogRequested(logger, user.Id, deletion.Id);
        return (new AccountDeletionResponse(deletion.Id, deletion.RequestedAt, scheduled), true);
    }

    private Task<AccountDeletionResponse?> PendingAsync(Guid userId, CancellationToken cancellationToken) =>
        Db.AccountDeletionRequests.AsNoTracking()
            .Where(r => r.UserId == userId && r.Status == AccountDeletionRequest.Pending)
            .Select(r => new AccountDeletionResponse(r.Id, r.RequestedAt, r.ScheduledErasureAt!.Value))
            .SingleOrDefaultAsync(cancellationToken);

    private async Task SaveIgnoringRacesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await Db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // A parallel request moved the failure counter first.
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "User {UserId} requested account deletion {RequestId}")]
    private static partial void LogRequested(ILogger logger, Guid userId, Guid requestId);
}
