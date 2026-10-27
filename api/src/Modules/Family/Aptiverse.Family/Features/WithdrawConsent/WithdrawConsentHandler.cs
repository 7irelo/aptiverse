using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.WithdrawConsent;

/// <summary>
/// The consenting parent withdraws consent (POPIA section 11(2)(b)). Allowed after the link is gone too, because
/// consent is about processing, not visibility. Anyone else learns nothing: an unlinked student is 404.
/// </summary>
internal sealed partial class WithdrawConsentHandler(IDbContextOutbox<FamilyDbContext> outbox, IClock clock, ILogger<WithdrawConsentHandler> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    public Task<Result> HandleAsync(Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken) =>
        FamilyLocks.RunAsync<Result>(Db, studentUserId, async () =>
        {
            var current = await Db.CurrentConsentAsync(studentUserId, cancellationToken);
            var isConsentingParent = current is { IsGrant: true } && current.ParentUserId == parentUserId;
            if (!isConsentingParent)
            {
                var linked = await Db.ActiveLinkAsync(parentUserId, studentUserId, cancellationToken) is not null;
                if (!linked)
                {
                    return FamilyErrors.ChildNotFound;
                }

                return current is { IsGrant: true } ? FamilyErrors.ConsentNotParent : FamilyErrors.ConsentNotFound;
            }

            var now = clock.UtcNow;
            var withdrawal = ParentalConsentRecord.Withdraw(current!, ConsentRecordSources.Parent, now);
            Db.ParentalConsents.Add(withdrawal);
            await outbox.PublishAsync(new ParentalConsentWithdrawn(current!.Id, studentUserId, parentUserId, now));
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

            FamilyMetrics.ConsentChanged(ConsentActions.Withdrawn);
            LogWithdrawn(logger, parentUserId, studentUserId);
            return Result.Success();
        }, cancellationToken);

    [LoggerMessage(Level = LogLevel.Information, Message = "Parent {UserId} withdrew parental consent for student {StudentId}")]
    private static partial void LogWithdrawn(ILogger logger, Guid userId, Guid studentId);
}
