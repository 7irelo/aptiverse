using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.ResendVerification;

/// <summary>
/// Queues a verification email. The lookup happens in <see cref="Messaging.EmailVerificationIssuer"/> after the response, so
/// existing, verified and unknown addresses all get the same 202 in the same time.
/// </summary>
internal sealed class ResendVerificationHandler(IDbContextOutbox<IdentityDbContext> outbox, EmailAddresses emails, EmailRateLimiter throttle)
{
    public static readonly Error EmailRequired =
        IdentityErrors.Field("identity.email_required", "email", "Enter the email address you registered with.");

    public async Task<Result> HandleAsync(Guid? userId, ResendVerificationRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        string? normalized = null;
        if (request.Email is not null)
        {
            normalized = emails.Normalize(request.Email);
        }
        else if (userId is not null)
        {
            normalized = await outbox.DbContext.Users.AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => u.NormalizedEmail)
                .SingleOrDefaultAsync(cancellationToken);
        }

        if (normalized is null)
        {
            return userId is null ? EmailRequired : Result.Success();
        }

        if (!throttle.TryAcquireVerification(normalized))
        {
            return AuthRateLimiting.TooManyAttempts(TimeSpan.FromMinutes(1), AuthRateLimiting.GenericDetail);
        }

        await outbox.PublishAsync(new IssueEmailVerification(normalized));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        return Result.Success();
    }
}
