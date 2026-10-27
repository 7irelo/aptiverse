using Aptiverse.Progress.Features.Common;
using FluentValidation;

namespace Aptiverse.Progress.Features.UpdateMilestone;

internal sealed class UpdateMilestoneValidator : AbstractValidator<UpdateMilestoneRequest>
{
    public UpdateMilestoneValidator()
    {
        RuleFor(r => r.Title).MilestoneTitle().When(r => r.Title is not null);
        RuleFor(r => r.ThresholdValue).Must(t => t is null || GoalRules.IsValidThreshold(t.Value))
            .WithMessage("Thresholds are above 0 and below 100.");
    }
}
