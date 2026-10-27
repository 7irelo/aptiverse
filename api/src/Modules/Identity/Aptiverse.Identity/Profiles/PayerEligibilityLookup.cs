using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Profiles;

/// <summary>Derives the minor flag from the date of birth here, so the date never leaves Identity.</summary>
internal sealed class PayerEligibilityLookup(IdentityDbContext db, IClock clock) : IPayerEligibilityLookup
{
    public async Task<PayerEligibility?> GetAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await db.Users.AsNoTracking().Include(u => u.Roles).SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var consent = await db.UserConsents.AsNoTracking()
            .AnyAsync(c => c.UserId == userId && c.DocumentKey == UserConsent.ParentalConsent && c.WithdrawnAt == null, cancellationToken);
        return new PayerEligibility(Ages.IsMinor(user, Ages.Today(clock)), consent);
    }
}
