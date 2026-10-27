using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Paging;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.ListGoals;

/// <summary>One query over the caller's goals; progress is derived in memory from the stored values.</summary>
internal sealed class ListGoalsHandler(ProgressDbContext db)
{
    public async Task<PagedResult<GoalSummary>> HandleAsync(Guid userId, ListGoalsRequest request, CancellationToken cancellationToken)
    {
        var goals = db.Goals.AsNoTracking().Where(g => g.UserId == userId);
        if (request.Status is { } status)
        {
            goals = status == GoalStatuses.Active
                ? goals.Where(g => GoalStatuses.Open.Contains(g.Status))
                : goals.Where(g => g.Status == status);
        }

        if (request.StudyUnitId is { } unitId)
        {
            goals = goals.Where(g => g.StudyUnitId == unitId);
        }

        var total = await goals.LongCountAsync(cancellationToken);
        var page = await goals
            .OrderBy(g => g.SortOrder)
            .ThenBy(g => g.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<GoalSummary>(page.Select(ToSummary).ToList(), request.Page, request.PageSize, total);
    }

    public static GoalSummary ToSummary(Goal goal)
    {
        ArgumentNullException.ThrowIfNull(goal);
        return new GoalSummary(
            goal.Id,
            goal.Title,
            goal.CriteriaType,
            goal.StudyUnitId,
            goal.Topic,
            goal.AssessmentId,
            goal.TargetValue,
            goal.BaselineValue,
            goal.CurrentValue,
            GoalEvaluator.ProgressPercent(goal.CurrentValue, goal.TargetValue),
            goal.Status,
            goal.DueAt,
            goal.IsLocked,
            goal.SortOrder);
    }
}
