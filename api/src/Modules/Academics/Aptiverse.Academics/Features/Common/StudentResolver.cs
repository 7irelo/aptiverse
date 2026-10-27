using Aptiverse.Academics.Domain;
using Aptiverse.Identity.Contracts;

namespace Aptiverse.Academics.Features.Common;

/// <summary>Builds the caller's <see cref="StudentContext"/> from Identity. Null when they have no study profile.</summary>
internal sealed class StudentResolver(IStudentProfileLookup profiles, ReferenceCache reference)
{
    public async Task<StudentContext?> ResolveAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await profiles.GetAsync(userId, cancellationToken);
        if (profile is null)
        {
            return null;
        }

        var institution = profile.Stage == Stages.University
            ? await reference.FindInstitutionAsync(profile.InstitutionName, cancellationToken)
            : null;

        return new StudentContext(userId, profile, institution);
    }
}
