using Aptiverse.Practice.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Practice.Erasure;

/// <summary>
/// Soft deletes every practice row of a user: tests, their questions and generation jobs, attempts, answers and
/// topic scores. Pending scheduled messages (polls, deadlines, grading) then find nothing and stop. Idempotent.
/// </summary>
internal sealed partial class PracticeUserDataEraser(PracticeDbContext db, ILogger<PracticeUserDataEraser> logger)
{
    public async Task EraseAsync(Guid userId, CancellationToken cancellationToken)
    {
        var tests = await db.Tests.Where(t => t.UserId == userId).ToListAsync(cancellationToken);
        var testIds = tests.Select(t => t.Id).ToList();
        var questions = await db.Questions.Where(q => testIds.Contains(q.TestId)).ToListAsync(cancellationToken);
        var jobs = await db.GenerationJobs.Where(j => j.UserId == userId).ToListAsync(cancellationToken);
        var attempts = await db.Attempts.Where(a => a.UserId == userId).ToListAsync(cancellationToken);
        var answers = await db.Answers.Where(a => a.UserId == userId).ToListAsync(cancellationToken);
        var scores = await db.AttemptTopicScores.Where(s => s.UserId == userId).ToListAsync(cancellationToken);

        db.AttemptTopicScores.RemoveRange(scores);
        db.Answers.RemoveRange(answers);
        db.Attempts.RemoveRange(attempts);
        db.GenerationJobs.RemoveRange(jobs);
        db.Questions.RemoveRange(questions);
        db.Tests.RemoveRange(tests);
        await db.SaveChangesAsync(cancellationToken);

        LogErased(logger, userId, tests.Count, attempts.Count, answers.Count);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Erased practice data of user {UserId}: {Tests} tests, {Attempts} attempts, {Answers} answers")]
    private static partial void LogErased(ILogger logger, Guid userId, int tests, int attempts, int answers);
}
