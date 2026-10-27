using Aptiverse.Progress.Domain;
using FluentValidation;

namespace Aptiverse.Progress.Features.ReorderMilestones;

internal sealed class ReorderMilestonesValidator : AbstractValidator<ReorderMilestonesRequest>
{
    public ReorderMilestonesValidator()
    {
        RuleFor(r => r.MilestoneIds).NotNull().Must(ids => ids is not null && ids.Count <= Goal.MaxMilestones)
            .WithMessage($"Send at most {Goal.MaxMilestones} milestone ids.");
        RuleForEach(r => r.MilestoneIds).NotEmpty();
    }
}
