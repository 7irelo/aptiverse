using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.VerifyEmail;

/// <summary>Consumes a verification token and confirms the address. A fresh token for an already verified account still succeeds.</summary>
internal sealed partial class VerifyEmailHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    OneTimeTokens oneTimeTokens,
    IClock clock,
    ILogger<VerifyEmailHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    public async Task<Result> HandleAsync(VerifyEmailRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var redeemed = await oneTimeTokens.RedeemAsync(request.Token, TokenPurposes.EmailVerification, cancellationToken);
        if (redeemed.IsFailure)
        {
            IdentityMetrics.EmailVerification("invalid");
            return redeemed.Error!;
        }

        var user = await Db.Users.SingleOrDefaultAsync(u => u.Id == redeemed.Value, cancellationToken);
        if (user is null)
        {
            IdentityMetrics.EmailVerification("invalid");
            return OneTimeTokens.InvalidToken;
        }

        var outcome = user.EmailConfirmed ? "already_verified" : "verified";
        if (!user.EmailConfirmed)
        {
            user.ConfirmEmail();
            Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.EmailVerified, user.Id, null, origin));
            await outbox.PublishAsync(new EmailVerified(user.Id, clock.UtcNow));
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        IdentityMetrics.EmailVerification(outcome);
        LogVerified(logger, user.Id, outcome);
        return Result.Success();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Email verification for user {UserId}: {Outcome}")]
    private static partial void LogVerified(ILogger logger, Guid userId, string outcome);
}
