using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Features.GetMe;

internal sealed class GetMeHandler(IdentityDbContext db, SessionService sessions, IOptions<LegalOptions> legal, IClock clock)
{
    private static readonly string[] RoleRank = [Roles.Admin, Roles.Parent, Roles.Student];

    public async Task<Result<MeResponse>> HandleAsync(Guid userId, Guid? sessionId, CancellationToken cancellationToken)
    {
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            // The account went away mid-session: end the session so the access token stops working too.
            if (sessionId is not null && await db.Sessions.SingleOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, cancellationToken) is { } session)
            {
                await sessions.RevokeAsync(session, RevocationReasons.AccountDeleted, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
                await sessions.EvictAsync([session.Id]);
            }

            return IdentityErrors.UserNotFound;
        }

        var consents = await db.UserConsents.AsNoTracking()
            .Where(c => c.UserId == userId && c.WithdrawnAt == null)
            .OrderByDescending(c => c.AcceptedAt)
            .Select(c => new { c.DocumentKey, c.DocumentVersion, c.AcceptedAt })
            .ToListAsync(cancellationToken);
        var deletion = await db.AccountDeletionRequests.AsNoTracking()
            .Where(r => r.UserId == userId && r.Status == AccountDeletionRequest.Pending)
            .Select(r => new DeletionRequestSummary(r.Id, r.RequestedAt, r.ScheduledErasureAt))
            .SingleOrDefaultAsync(cancellationToken);

        var terms = consents.FirstOrDefault(c => c.DocumentKey == UserConsent.Terms)?.DocumentVersion;
        var privacy = consents.FirstOrDefault(c => c.DocumentKey == UserConsent.Privacy)?.DocumentVersion;
        var adultConfirmedAt = consents.FirstOrDefault(c => c.DocumentKey == UserConsent.AdultConfirmation)?.AcceptedAt;
        var roles = user.RoleNames;

        return new MeResponse(
            user.Id,
            user.Name,
            user.Email,
            user.EmailConfirmed,
            PendingEmail: null,
            HasPassword: user.PasswordHash is not null,
            user.PhoneNumber,
            user.DateOfBirth,
            adultConfirmedAt,
            roles,
            PrimaryRole(roles),
            RolePermissions.For(roles),
            Entitlements: [],
            Ages.IsMinor(user, Ages.Today(clock)),
            new OnboardingSummary(
                user.RequiresOnboarding,
                user.OnboardingCompletedAt,
                user.EducationLevel,
                user.Grade,
                user.Curriculum,
                user.StudyLevel,
                user.YearOfStudy,
                user.Programme,
                user.InstitutionName,
                user.DateOfBirth),
            new ConsentSummary(terms, privacy, terms != legal.Value.TermsVersion || privacy != legal.Value.PrivacyVersion),
            deletion,
            user.CreatedAt);
    }

    public static string? PrimaryRole(IReadOnlyList<string> roles) => RoleRank.FirstOrDefault(roles.Contains);
}
