using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Progress.Features.UpdateGoal;

internal sealed class UpdateGoalValidator : AbstractValidator<UpdateGoalRequest>
{
    public const int MaxSortOrder = 10_000;

    public UpdateGoalValidator(IClock clock)
    {
        RuleFor(r => r.Title).GoalTitle();
        RuleFor(r => r.Description).GoalDescription();
        RuleFor(r => r.TargetValue).Must(t => t is null || GoalRules.IsValidTarget(null, t.Value))
            .WithMessage("The target is 1 to 100 with at most two decimals.");
        RuleFor(r => r.DueAt).Must(due => due is null || GoalRules.IsValidDue(due.Value, clock.UtcNow))
            .WithMessage("The due date must be at least 1 day and at most a year ahead.");
        RuleFor(r => r.SortOrder).InclusiveBetween(0, MaxSortOrder);
    }
}
