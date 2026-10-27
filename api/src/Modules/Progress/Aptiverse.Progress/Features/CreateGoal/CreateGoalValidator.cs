using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Progress.Features.CreateGoal;

internal sealed class CreateGoalValidator : AbstractValidator<CreateGoalRequest>
{
    public CreateGoalValidator(IClock clock)
    {
        RuleFor(r => r.Title).NotNull().GoalTitle();
        RuleFor(r => r.Description).GoalDescription();
        RuleFor(r => r.CriteriaType).CriteriaType();
        RuleFor(r => r.StudyUnitId).NotEmpty();
        RuleFor(r => r.Topic).GoalTopic();
        RuleFor(r => r.Topic).Null().When(r => r.CriteriaType != CriteriaTypes.MasteryThreshold)
            .WithMessage("Topic applies to mastery goals only.");
        RuleFor(r => r.AssessmentId).OptionalId();
        RuleFor(r => r.TargetValue).Must((r, target) => GoalRules.IsValidTarget(r.CriteriaType, target))
            .WithMessage("Count goals take a whole number from 1 to 100; percent goals 1 to 100 with at most two decimals.");
        RuleFor(r => r.DueAt).Must(due => GoalRules.IsValidDue(due, clock.UtcNow))
            .WithMessage("The due date must be at least 1 day and at most a year ahead.");
        RuleFor(r => r.Milestones).Must(m => m is null || m.Count <= Goal.MaxMilestones)
            .WithMessage($"At most {Goal.MaxMilestones} milestones.");
        RuleForEach(r => r.Milestones).ChildRules(m =>
        {
            m.RuleFor(x => x.Title).MilestoneTitle();
            m.RuleFor(x => x.ThresholdValue).Must(GoalRules.IsValidThreshold).WithMessage("Thresholds are above 0 and below 100.");
        });
        RuleFor(r => r.Milestones)
            .Must((r, m) => m is null || MilestoneRules.AreValid(m.Select(x => x.ThresholdValue).ToList(), r.TargetValue))
            .WithMessage("Milestone thresholds must increase step by step and stay below the target.");
        RuleFor(r => r.Milestones)
            .Must((r, m) => m is null || r.CriteriaType is null || !CriteriaTypes.IsCount(r.CriteriaType) || m.All(x => decimal.Truncate(x.ThresholdValue) == x.ThresholdValue))
            .WithMessage("Count goal milestones are whole numbers.");
    }
}
