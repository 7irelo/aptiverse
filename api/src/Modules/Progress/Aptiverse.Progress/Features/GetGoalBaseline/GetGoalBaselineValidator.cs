using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using FluentValidation;

namespace Aptiverse.Progress.Features.GetGoalBaseline;

internal sealed class GetGoalBaselineValidator : AbstractValidator<GetGoalBaselineRequest>
{
    public GetGoalBaselineValidator()
    {
        RuleFor(r => r.CriteriaType).CriteriaType();
        RuleFor(r => r.StudyUnitId).NotEmpty();
        RuleFor(r => r.Topic).GoalTopic();
        RuleFor(r => r.Topic).Null().When(r => r.CriteriaType != CriteriaTypes.MasteryThreshold)
            .WithMessage("Topic applies to mastery goals only.");
        RuleFor(r => r.AssessmentId).OptionalId();
    }
}
