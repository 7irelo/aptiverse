using Aptiverse.Academics.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Academics.Features.EraseUserData;

/// <summary>
/// Soft deletes a user's academic records: their assessments, their enrolments, and the private courses they own
/// (courses outside the catalog) with those courses' topics. Shared units and their emergent topics stay, because
/// they carry nothing about who added them. Idempotent, so a retried message is harmless.
/// </summary>
internal sealed partial class AcademicsUserDataEraser(AcademicsDbContext db, ILogger<AcademicsUserDataEraser> logger)
{
    public async Task EraseAsync(Guid userId, CancellationToken cancellationToken)
    {
        var assessments = await db.Assessments.Where(a => a.UserId == userId).ToListAsync(cancellationToken);
        var enrolments = await db.Enrolments.Where(e => e.UserId == userId).ToListAsync(cancellationToken);
        var privateUnits = await db.StudyUnits.Where(u => u.OwnerUserId == userId).ToListAsync(cancellationToken);
        var privateUnitIds = privateUnits.Select(u => u.Id).ToList();
        var privateTopics = await db.Topics.Where(t => privateUnitIds.Contains(t.StudyUnitId)).ToListAsync(cancellationToken);

        db.Assessments.RemoveRange(assessments);
        db.Enrolments.RemoveRange(enrolments);
        db.Topics.RemoveRange(privateTopics);
        db.StudyUnits.RemoveRange(privateUnits);
        await db.SaveChangesAsync(cancellationToken);

        LogErased(logger, userId, enrolments.Count, assessments.Count, privateUnits.Count);
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Erased academics data of user {UserId}: {Enrolments} enrolments, {Assessments} assessments, {PrivateCourses} private courses")]
    private static partial void LogErased(ILogger logger, Guid userId, int enrolments, int assessments, int privateCourses);
}
