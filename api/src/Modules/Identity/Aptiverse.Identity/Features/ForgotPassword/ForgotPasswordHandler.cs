using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Messaging;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.ForgotPassword;

/// <summary>
/// Queues a password reset without looking the account up: <see cref="PasswordResetIssuer"/> does that after the
/// response, so a real and an unknown address get the same 202 in the same time and nothing reveals which is which.
/// </summary>
internal sealed class ForgotPasswordHandler(IDbContextOutbox<IdentityDbContext> outbox, EmailAddresses emails, EmailRateLimiter throttle)
{
    public async Task<Result> HandleAsync(ForgotPasswordRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var normalized = emails.Normalize(request.Email);
        if (!throttle.TryAcquirePasswordReset(normalized))
        {
            return AuthRateLimiting.TooManyAttempts(TimeSpan.FromMinutes(1), AuthRateLimiting.GenericDetail);
        }

        await outbox.PublishAsync(new IssuePasswordReset(normalized, origin.IpAddress, origin.UserAgent));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        return Result.Success();
    }
}
