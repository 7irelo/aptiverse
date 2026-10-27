using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GetTest;

internal sealed class GetPracticeTestHandler(PracticeDbContext db, AttemptViews views, IClock clock)
{
    public async Task<Result<PracticeTestInstructions>> HandleAsync(Guid userId, Guid testId, CancellationToken cancellationToken)
    {
        var test = await db.Tests.AsNoTracking().SingleOrDefaultAsync(t => t.Id == testId && t.UserId == userId, cancellationToken);
        if (test is null)
        {
            return PracticeErrors.TestNotFound;
        }

        var attempt = await db.Attempts.AsNoTracking()
            .SingleOrDefaultAsync(a => a.TestId == test.Id && a.UserId == userId, cancellationToken);
        var now = clock.UtcNow;
        var active = attempt is { IsActive: true } ? await views.BuildAsync(attempt, now, cancellationToken) : null;

        return new PracticeTestInstructions(
            test.Id,
            test.Title,
            test.StudyUnitId,
            test.AssessmentId,
            test.Format,
            test.Mode,
            test.DurationMinutes,
            test.QuestionCount,
            test.TotalMarks,
            test.Topics,
            test.Difficulty,
            !test.IsTimed,
            test.Status,
            now,
            attempt is null ? null : new AttemptRef(attempt.Id, attempt.Status),
            active);
    }
}
