using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.ListGoals;

internal sealed class ListGoalsValidator : AbstractValidator<ListGoalsRequest>
{
    public ListGoalsValidator()
    {
        RuleFor(r => r.Status).Must(s => s is null || GoalStatuses.Filters.Contains(s))
            .WithMessage($"Status must be one of: {string.Join(", ", GoalStatuses.Filters)}.");
        RuleFor(r => r.StudyUnitId).OptionalId();
        RuleFor(r => r.Page).InclusiveBetween(1, 10_000);
        RuleFor(r => r.PageSize).InclusiveBetween(1, ListGoalsRequest.MaxPageSize);
    }
}
