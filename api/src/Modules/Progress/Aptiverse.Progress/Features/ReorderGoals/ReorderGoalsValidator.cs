using FluentValidation;

namespace Aptiverse.Progress.Features.ReorderGoals;

internal sealed class ReorderGoalsValidator : AbstractValidator<ReorderGoalsRequest>
{
    public const int MaxIds = 100;

    public ReorderGoalsValidator()
    {
        RuleFor(r => r.GoalIds).NotNull().Must(ids => ids is not null && ids.Count <= MaxIds)
            .WithMessage($"Send at most {MaxIds} goal ids.");
        RuleForEach(r => r.GoalIds).NotEmpty();
    }
}
