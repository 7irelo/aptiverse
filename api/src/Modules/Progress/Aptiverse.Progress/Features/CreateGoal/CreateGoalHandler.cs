using System.Text.RegularExpressions;
using Aptiverse.Academics.Contracts;
using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Goals;
using Aptiverse.Progress.Persistence;
using Aptiverse.Progress.Persistence.Configurations;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.CreateGoal;

internal sealed partial class CreateGoalHandler(
    IDbContextOutbox<ProgressDbContext> outbox,
    IStudyUnitLookup units,
    IAssessmentLookup assessments,
    GoalMeasurer measurer,
    GoalProgress progress,
    IClock clock,
    IOptions<ProgressOptions> options,
    ILogger<CreateGoalHandler> logger)
{
    public static readonly Error InvalidIdempotencyKey = Error.Validation(
        "goal.invalid_idempotency_key",
        "The Idempotency-Key header must be 8 to 64 letters, digits, dashes or underscores.",
        new Dictionary<string, string[]> { ["Idempotency-Key"] = ["Use 8 to 64 letters, digits, dashes or underscores."] });

    private static readonly IReadOnlyList<string> UpcomingStates = ["scheduled", "in_progress"];

    private ProgressDbContext Db => outbox.DbContext;

    public async Task<Result<(GoalView View, string ETag)>> HandleAsync(
        Guid userId,
        CreateGoalRequest request,
        string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (idempotencyKey is not null && !IdempotencyKey().IsMatch(idempotencyKey))
        {
            return InvalidIdempotencyKey;
        }

        if (idempotencyKey is not null && await ReplayAsync(userId, idempotencyKey, cancellationToken) is { } replay)
        {
            return replay;
        }

        if (await units.GetAsync(request.StudyUnitId, userId, cancellationToken) is null)
        {
            return ProgressErrors.StudyUnitNotFound;
        }

        if (request.AssessmentId is { } assessmentId)
        {
            var assessment = await assessments.GetForUserAsync(userId, assessmentId, cancellationToken);
            if (assessment is null || assessment.StudyUnitId != request.StudyUnitId)
            {
                return ProgressErrors.AssessmentNotFound;
            }

            if (!UpcomingStates.Contains(assessment.State) || assessment.DueAt > request.DueAt)
            {
                return ProgressErrors.AssessmentNotUpcoming;
            }
        }

        var criteriaType = request.CriteriaType!;
        var topic = criteriaType == CriteriaTypes.MasteryThreshold && !string.IsNullOrWhiteSpace(request.Topic) ? TopicKeys.Display(request.Topic) : null;
        var topicKey = topic is null ? TopicKeys.WholeUnit : TopicKeys.Key(topic);

        try
        {
            return await UserLocks.RunAsync<Result<(GoalView View, string ETag)>>(Db, userId, async () =>
            {
                var open = await Db.Goals.CountAsync(g => g.UserId == userId && GoalStatuses.Open.Contains(g.Status), cancellationToken);
                if (open >= options.Value.MaxActiveGoals)
                {
                    return ProgressErrors.ActiveLimit(options.Value.MaxActiveGoals);
                }

                var duplicate = await Db.Goals.AnyAsync(
                    g => g.UserId == userId && GoalStatuses.Open.Contains(g.Status) && g.CriteriaType == criteriaType
                        && g.StudyUnitId == request.StudyUnitId && g.TopicKey == topicKey && g.AssessmentId == request.AssessmentId,
                    cancellationToken);
                if (duplicate)
                {
                    return ProgressErrors.DuplicateActive;
                }

                // Measured inside the lock, so no evidence can land between the baseline and the insert.
                var baseline = await measurer.BaselineAsync(
                    new GoalCriteria(userId, request.StudyUnitId, criteriaType, topicKey, topic, request.AssessmentId),
                    cancellationToken);
                if (!GoalEvaluator.IsAboveBaseline(request.TargetValue, baseline.Value))
                {
                    ProgressMetrics.BaselineRefused();
                    return ProgressErrors.TargetNotAboveBaseline(baseline.Value!.Value);
                }

                var sortOrder = await Db.Goals.Where(g => g.UserId == userId).MaxAsync(g => (int?)g.SortOrder, cancellationToken) ?? 0;
                var now = clock.UtcNow;
                var goal = Goal.Create(
                    userId,
                    request.StudyUnitId,
                    request.Title!,
                    request.Description,
                    criteriaType,
                    topic,
                    request.AssessmentId,
                    request.TargetValue,
                    baseline.Value,
                    request.DueAt,
                    sortOrder + 1,
                    idempotencyKey,
                    now);
                Db.Goals.Add(goal);
                var position = 1;
                foreach (var input in request.Milestones ?? [])
                {
                    Db.Milestones.Add(Milestone.Create(goal.Id, position++, input.Title!, input.ThresholdValue));
                }

                progress.Journey(JourneyKinds.GoalCreated, goal, $"Goal set: {goal.Title}", goal.Id, now);
                await outbox.PublishAsync(new GoalCreated(goal.Id, userId, criteriaType, goal.DueAt, now));
                await outbox.ScheduleAsync(new ExpireProgressGoal(goal.Id, goal.DueAt), goal.DueAt);
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

                ProgressMetrics.GoalCreated(criteriaType);
                LogCreated(logger, userId, goal.Id, criteriaType, request.StudyUnitId, goal.TargetValue, goal.BaselineValue);
                return Result.Success((await Db.ToViewAsync(goal, cancellationToken), ETags.Of(Db, goal)));
            }, cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex, GoalConfiguration.IdempotencyIndex))
        {
            Db.ChangeTracker.Clear();
            return await ReplayAsync(userId, idempotencyKey!, cancellationToken) is { } raced ? raced : ProgressErrors.DuplicateActive;
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex, GoalConfiguration.DuplicateActiveIndex))
        {
            return ProgressErrors.DuplicateActive;
        }
    }

    private async Task<Result<(GoalView View, string ETag)>?> ReplayAsync(Guid userId, string idempotencyKey, CancellationToken cancellationToken)
    {
        var goal = await Db.Goals.SingleOrDefaultAsync(g => g.UserId == userId && g.IdempotencyKey == idempotencyKey, cancellationToken);
        return goal is null ? null : Result.Success((await Db.ToViewAsync(goal, cancellationToken), ETags.Of(Db, goal)));
    }

    [GeneratedRegex("^[A-Za-z0-9_-]{8,64}$")]
    private static partial Regex IdempotencyKey();

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} created goal {GoalId} ({CriteriaType}) in unit {StudyUnitId}: target {Target}, baseline {Baseline}")]
    private static partial void LogCreated(ILogger logger, Guid userId, Guid goalId, string criteriaType, Guid studyUnitId, decimal target, decimal? baseline);
}
