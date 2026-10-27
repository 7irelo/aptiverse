using Aptiverse.Academics.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Goals;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Progress.Features.GetGoalBaseline;

internal sealed class GetGoalBaselineHandler(IStudyUnitLookup units, GoalMeasurer measurer)
{
    public async Task<Result<GoalPreview>> HandleAsync(Guid userId, GetGoalBaselineRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (await units.GetAsync(request.StudyUnitId, userId, cancellationToken) is null)
        {
            return ProgressErrors.StudyUnitNotFound;
        }

        var topic = string.IsNullOrWhiteSpace(request.Topic) ? null : TopicKeys.Display(request.Topic);
        var baseline = await measurer.BaselineAsync(
            new GoalCriteria(userId, request.StudyUnitId, request.CriteriaType!, topic is null ? TopicKeys.WholeUnit : TopicKeys.Key(topic), topic, request.AssessmentId),
            cancellationToken);
        ProgressMetrics.BaselineLookup(request.CriteriaType!);
        return new GoalPreview(baseline.Value, baseline.Source, GoalEvaluator.MinimumTarget(baseline.Value), baseline.EarlyRead);
    }
}
