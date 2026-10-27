using System.Globalization;
using Aptiverse.Academics.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Goals;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Progress.Evidence;

/// <summary>
/// Turns Practice and Academics events into Progress evidence, under the student's advisory lock, in two steps.
/// First the facts (practice result, assessment record, observations, journey line) are written once; then the
/// projections and goals are recomputed from all facts and saved with the events through the outbox. The second
/// step runs on every delivery and is deterministic, so a redelivery after a crash between the steps repairs the
/// projections instead of being skipped, and a plain redelivery changes nothing.
/// </summary>
internal sealed partial class EvidenceIngestor(
    IDbContextOutbox<ProgressDbContext> outbox,
    MasteryProjector mastery,
    GoalProgress goals,
    IClock clock,
    IOptions<ProgressOptions> options,
    ILogger<EvidenceIngestor> logger)
{
    private ProgressDbContext Db => outbox.DbContext;

    public Task OnPracticeGradedAsync(PracticeAttemptGraded message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        return UserLocks.RunAsync(Db, message.UserId, async () =>
        {
            var known = await Db.PracticeResults.IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                .Where(r => r.AttemptId == message.AttemptId)
                .Select(r => new { r.UserId, r.DeletedAt })
                .SingleOrDefaultAsync(cancellationToken);
            if (known is not null && (known.UserId != message.UserId || known.DeletedAt is not null))
            {
                // Erased with the account, or an id that is not this user's: nothing to repair.
                return;
            }

            // Pending written answers are not wrong answers: only marked questions are evidence. A partly graded
            // attempt counts its marked questions; one from before marked counts existed carries zero and adds none.
            var topics = message.Topics
                .Select(t => (t.Topic, Counted: message.PartiallyGraded ? Math.Clamp(t.QuestionsMarked, 0, t.QuestionsTotal) : t.QuestionsTotal, t.QuestionsCorrect))
                .Where(t => t.Counted > 0 && !string.IsNullOrWhiteSpace(t.Topic) && TopicKeys.Key(t.Topic).Length > 0)
                .GroupBy(t => TopicKeys.Key(t.Topic), StringComparer.Ordinal)
                .Select(g => (Topic: g.First().Topic, Total: g.Sum(t => t.Counted), Correct: g.Sum(t => Math.Clamp(t.QuestionsCorrect, 0, t.Counted))))
                .ToList();

            var summary = message.PartiallyGraded
                ? "Practice test submitted, some answers not marked yet"
                : string.Create(CultureInfo.InvariantCulture, $"Practice test, {message.ScorePercent:0.##}%");
            var link = $"/practice/attempts/{message.AttemptId}/results";

            if (known is null)
            {
                Db.PracticeResults.Add(PracticeResult.Create(
                    message.UserId,
                    message.StudyUnitId,
                    message.AttemptId,
                    message.TestId,
                    message.ScorePercent,
                    message.PartiallyGraded,
                    message.SecondsOnTask,
                    message.SubmittedAt,
                    message.OccurredAt));
                foreach (var (topic, total, correct) in topics)
                {
                    Db.MasteryObservations.Add(MasteryObservation.ForPractice(
                        message.UserId, message.StudyUnitId, topic, message.AttemptId, total, correct, message.SubmittedAt, message.OccurredAt));
                }

                Db.JourneyEvents.Add(JourneyEvent.Create(
                    message.UserId, JourneyKinds.PracticeCompleted, summary, link, EvidenceSources.PracticeAttempt, message.AttemptId, message.SubmittedAt));
                await Db.SaveChangesAsync(cancellationToken);
            }

            var events = new List<object>();
            await RecomputeAsync(message.UserId, message.StudyUnitId, topics.Select(t => TopicKeys.Key(t.Topic)).ToList(), message.AttemptId, message.SubmittedAt, events, cancellationToken);
            await goals.EvaluateUnitAsync(
                message.UserId,
                message.StudyUnitId,
                new EvidenceSource(EvidenceSources.PracticeAttempt, message.AttemptId, message.SubmittedAt, summary, link),
                events,
                cancellationToken);
            await CommitAsync(events, cancellationToken);
            ProgressMetrics.EventLag(clock.UtcNow - message.OccurredAt);
            LogIngested(logger, nameof(PracticeAttemptGraded), message.UserId, topics.Count);
        }, cancellationToken);
    }

    public Task OnAssessmentGradedAsync(AssessmentGraded message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        return OnAssessmentAsync(
            message.UserId,
            message.StudyUnitId,
            message.AssessmentId,
            record => record.ApplyGraded(message.Percent, message.OccurredAt),
            record => string.Create(CultureInfo.InvariantCulture, $"Assessment mark, {record.MarkPercent:0.##}%"),
            EvidenceSources.AssessmentGraded,
            cancellationToken);
    }

    public Task OnAssessmentSubmittedAsync(AssessmentSubmitted message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        return OnAssessmentAsync(
            message.UserId,
            message.StudyUnitId,
            message.AssessmentId,
            record => record.ApplySubmitted(message.OccurredAt),
            _ => "Assessment submitted",
            EvidenceSources.AssessmentSubmitted,
            cancellationToken);
    }

    public Task OnAssessmentMarkRemovedAsync(AssessmentMarkRemoved message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        return OnAssessmentAsync(
            message.UserId,
            message.StudyUnitId,
            message.AssessmentId,
            record => record.ApplyMarkRemoved(message.OccurredAt),
            _ => "Assessment mark removed",
            EvidenceSources.Regrade,
            cancellationToken);
    }

    public Task OnAssessmentDeletedAsync(AssessmentDeleted message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        return OnAssessmentAsync(
            message.UserId,
            message.StudyUnitId,
            message.AssessmentId,
            record => record.ApplyDeleted(message.OccurredAt),
            _ => "Assessment deleted",
            EvidenceSources.Regrade,
            cancellationToken);
    }

    private Task OnAssessmentAsync(
        Guid userId,
        Guid studyUnitId,
        Guid assessmentId,
        Func<AssessmentRecord, bool> apply,
        Func<AssessmentRecord, string> summary,
        string sourceType,
        CancellationToken cancellationToken) =>
        UserLocks.RunAsync(Db, userId, async () =>
        {
            var record = await Db.AssessmentRecords.IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                .SingleOrDefaultAsync(r => r.AssessmentId == assessmentId, cancellationToken);
            if (record is not null && (record.UserId != userId || record.DeletedAt is not null))
            {
                return;
            }

            if (record is null)
            {
                record = AssessmentRecord.Create(userId, studyUnitId, assessmentId);
                Db.AssessmentRecords.Add(record);
            }

            var applied = apply(record);
            var link = $"/academics/assessments/{assessmentId}";
            if (applied && sourceType == EvidenceSources.AssessmentGraded && record.MarkRecordedAt is { } recordedAt)
            {
                Db.JourneyEvents.Add(JourneyEvent.Create(
                    userId,
                    JourneyKinds.AssessmentGraded,
                    summary(record),
                    link,
                    EvidenceSources.AssessmentGraded,
                    SourceIds.For(assessmentId, recordedAt, "mark"),
                    recordedAt));
            }

            await Db.SaveChangesAsync(cancellationToken);
            await SyncMarkObservationAsync(record, cancellationToken);

            // The evidence key comes from the record's current state, so a stale or repeated event maps to the
            // same row as the event that produced that state.
            var occurredAt = sourceType switch
            {
                EvidenceSources.AssessmentGraded => record.MarkRecordedAt ?? record.LastMarkEventAt,
                EvidenceSources.AssessmentSubmitted => record.SubmittedAt,
                _ => record.WithdrawnAt ?? record.LastMarkEventAt,
            } ?? clock.UtcNow;
            var events = new List<object>();
            await RecomputeAsync(userId, studyUnitId, [TopicKeys.WholeUnit], assessmentId, occurredAt, events, cancellationToken);
            await goals.EvaluateUnitAsync(
                userId,
                studyUnitId,
                new EvidenceSource(sourceType, SourceIds.For(assessmentId, occurredAt, sourceType), occurredAt, summary(record), link),
                events,
                cancellationToken);
            await CommitAsync(events, cancellationToken);
            LogIngested(logger, sourceType, userId, applied ? 1 : 0);
        }, cancellationToken);

    /// <summary>Keeps exactly one live whole-unit observation per assessment, matching its current mark.</summary>
    private async Task SyncMarkObservationAsync(AssessmentRecord record, CancellationToken cancellationToken)
    {
        var live = await Db.MasteryObservations.SingleOrDefaultAsync(
            o => o.SourceType == ObservationSources.AssessmentGraded && o.SourceId == record.AssessmentId && o.SupersededAt == null,
            cancellationToken);
        if (record.HasMark && live is not null && live.SourceEventAt == record.MarkRecordedAt)
        {
            return;
        }

        if (live is not null)
        {
            // Superseded before the replacement exists: the live-source unique index allows one live row.
            live.Supersede(clock.UtcNow, null);
            await Db.SaveChangesAsync(cancellationToken);
        }

        if (record.HasMark && record.MarkRecordedAt is { } recordedAt)
        {
            var replacement = MasteryObservation.ForMark(
                record.UserId, record.StudyUnitId, record.AssessmentId, record.MarkPercent!.Value, options.Value.MarkQuestionEquivalents, recordedAt);
            Db.MasteryObservations.Add(replacement);
            await Db.SaveChangesAsync(cancellationToken);
            if (live is not null)
            {
                live.Supersede(clock.UtcNow, replacement.Id);
                await Db.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private async Task RecomputeAsync(
        Guid userId,
        Guid studyUnitId,
        IReadOnlyCollection<string> keys,
        Guid sourceId,
        DateTimeOffset evidenceAt,
        List<object> events,
        CancellationToken cancellationToken)
    {
        var changes = await mastery.RecomputeAsync(userId, studyUnitId, keys, cancellationToken);
        foreach (var change in changes.Where(c => c.BandChanged))
        {
            events.Add(new MasteryUpdated(userId, studyUnitId, change.Topic, change.Value.Score, change.Value.Band, change.PreviousBand, evidenceAt));
            if (change.BandUp && change.TopicKey.Length > 0 && change.Value.Band is { } band)
            {
                var journeyId = SourceIds.For(sourceId, null, $"band:{change.TopicKey}:{band}");
                if (!await Db.JourneyEvents.IgnoreQueryFilters().AnyAsync(j => j.UserId == userId && j.SourceId == journeyId, cancellationToken))
                {
                    Db.JourneyEvents.Add(JourneyEvent.Create(
                        userId, JourneyKinds.TopicBandUp, $"{change.Topic} is now {band}", "/progress/mastery", "mastery", journeyId, evidenceAt));
                }
            }
        }

        ProgressMetrics.MasteryRecomputed(changes.Count);

        // Goals measure mastery from the saved projection.
        await Db.SaveChangesAsync(cancellationToken);
    }

    private async Task CommitAsync(List<object> events, CancellationToken cancellationToken)
    {
        foreach (var message in events)
        {
            await outbox.PublishAsync(message);
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Progress ingested {Event} for user {UserId} ({Count} items)")]
    private static partial void LogIngested(ILogger logger, string @event, Guid userId, int count);
}
