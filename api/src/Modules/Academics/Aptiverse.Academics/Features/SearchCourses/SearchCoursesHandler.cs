using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.SearchCourses;

/// <summary>
/// Shared courses of the caller's own catalog institution only, so a student can join an existing course (and its
/// topics) before creating one. Students without a catalog institution, and high school students, get nothing.
/// </summary>
internal sealed class SearchCoursesHandler(AcademicsDbContext db, StudentResolver students)
{
    private const int CountBucket = 5;

    public async Task<IReadOnlyList<CourseOption>> HandleAsync(Guid userId, SearchCoursesRequest request, CancellationToken cancellationToken)
    {
        var student = await students.ResolveAsync(userId, cancellationToken);
        if (student is not { IsTertiary: true, Institution: { } institution })
        {
            return [];
        }

        var q = Slugs.CleanText(request.Q!);
        var pattern = $"%{EscapeLike(q)}%";
        var prefix = $"{EscapeLike(q)}%";

        var rows = await db.StudyUnits.AsNoTracking()
            .Where(u => u.Kind == StudyUnitKinds.TertiaryCourse && u.InstitutionId == institution.Id && u.OwnerUserId == null)
            .Where(u => request.Level == null || u.Level == request.Level)
            .Where(u => EF.Functions.ILike(u.Name, pattern) || (u.CourseCode != null && EF.Functions.ILike(u.CourseCode, pattern)))
            .OrderByDescending(u => (u.CourseCode != null && EF.Functions.ILike(u.CourseCode, prefix)) || EF.Functions.ILike(u.Name, prefix))
            .ThenBy(u => u.Name)
            .ThenBy(u => u.Id)
            .Take(request.Limit)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.CourseCode,
                u.Level,
                Enrolled = db.Enrolments.Count(e => e.StudyUnitId == u.Id && e.Status == EnrolmentStatuses.Active),
            })
            .ToListAsync(cancellationToken);

        return rows
            .Select(r => new CourseOption(r.Id, r.Name, r.CourseCode, r.Level ?? string.Empty, Bucket(r.Enrolled)))
            .ToList();
    }

    internal static int? Bucket(int count) => count < CountBucket ? null : count / CountBucket * CountBucket;

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace("%", "\\%", StringComparison.Ordinal)
            .Replace("_", "\\_", StringComparison.Ordinal);
}
