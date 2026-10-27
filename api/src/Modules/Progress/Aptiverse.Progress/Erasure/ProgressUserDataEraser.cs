using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Progress.Erasure;

/// <summary>
/// Soft deletes every progress row of a user: goals with their milestones and evidence, mastery observations and
/// the projection, practice results, assessment records and the journey. Runs under the user's lock so an evidence
/// event in flight cannot write between the reads and the delete. Idempotent.
/// </summary>
internal sealed partial class ProgressUserDataEraser(ProgressDbContext db, ILogger<ProgressUserDataEraser> logger)
{
    public Task EraseAsync(Guid userId, CancellationToken cancellationToken) =>
        UserLocks.RunAsync(db, userId, async () =>
        {
            var goals = await db.Goals.Where(g => g.UserId == userId).ToListAsync(cancellationToken);
            var goalIds = goals.Select(g => g.Id).ToList();
            var milestones = await db.Milestones.Where(m => goalIds.Contains(m.GoalId)).ToListAsync(cancellationToken);
            var evidence = await db.GoalEvidence.Where(e => goalIds.Contains(e.GoalId)).ToListAsync(cancellationToken);
            var observations = await db.MasteryObservations.Where(o => o.UserId == userId).ToListAsync(cancellationToken);
            var mastery = await db.TopicMastery.Where(m => m.UserId == userId).ToListAsync(cancellationToken);
            var practice = await db.PracticeResults.Where(r => r.UserId == userId).ToListAsync(cancellationToken);
            var assessments = await db.AssessmentRecords.Where(r => r.UserId == userId).ToListAsync(cancellationToken);
            var journey = await db.JourneyEvents.Where(j => j.UserId == userId).ToListAsync(cancellationToken);

            db.GoalEvidence.RemoveRange(evidence);
            db.Milestones.RemoveRange(milestones);
            db.Goals.RemoveRange(goals);
            db.MasteryObservations.RemoveRange(observations);
            db.TopicMastery.RemoveRange(mastery);
            db.PracticeResults.RemoveRange(practice);
            db.AssessmentRecords.RemoveRange(assessments);
            db.JourneyEvents.RemoveRange(journey);
            await db.SaveChangesAsync(cancellationToken);

            LogErased(logger, userId, goals.Count, observations.Count, practice.Count + assessments.Count);
        }, cancellationToken);

    [LoggerMessage(Level = LogLevel.Information, Message = "Erased progress data of user {UserId}: {Goals} goals, {Observations} observations, {Results} results")]
    private static partial void LogErased(ILogger logger, Guid userId, int goals, int observations, int results);
}
