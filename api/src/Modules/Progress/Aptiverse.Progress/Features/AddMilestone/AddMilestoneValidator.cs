using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using FluentValidation;

namespace Aptiverse.Progress.Features.AddMilestone;

internal sealed class AddMilestoneValidator : AbstractValidator<AddMilestoneRequest>
{
    public AddMilestoneValidator()
    {
        RuleFor(r => r.Title).MilestoneTitle();
        RuleFor(r => r.ThresholdValue).Must(GoalRules.IsValidThreshold).WithMessage("Thresholds are above 0 and below 100.");
        RuleFor(r => r.Position).InclusiveBetween(1, Milestone.MaxPosition);
    }
}
