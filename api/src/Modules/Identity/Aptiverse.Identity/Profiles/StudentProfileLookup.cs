using System.Globalization;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Profiles;

/// <summary>Reads only the study fields of the user row. Email, name and phone never leave this query.</summary>
internal sealed class StudentProfileLookup(IdentityDbContext db) : IStudentProfileLookup
{
    public const string HighSchoolStage = "high_school";
    public const string UniversityStage = "university";

    public async Task<StudentProfile?> GetAsync(Guid userId, CancellationToken cancellationToken)
    {
        var row = await db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.EducationLevel, u.Grade, u.YearOfStudy, u.Curriculum, u.InstitutionName })
            .SingleOrDefaultAsync(cancellationToken);

        return row?.EducationLevel switch
        {
            EducationLevels.HighSchool => new StudentProfile(
                row.EducationLevel,
                row.Grade,
                null,
                row.Curriculum,
                HighSchoolStage,
                row.Grade is { } grade ? string.Create(CultureInfo.InvariantCulture, $"Grade {grade}") : "High school",
                null),
            EducationLevels.Tertiary => new StudentProfile(
                row.EducationLevel,
                null,
                row.YearOfStudy,
                null,
                UniversityStage,
                row.YearOfStudy is { } year ? string.Create(CultureInfo.InvariantCulture, $"Year {year}") : "University",
                row.InstitutionName),
            _ => null,
        };
    }
}
