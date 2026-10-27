using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Academics.Features.UpdateMyAssessment;

internal sealed class UpdateMyAssessmentValidator : AbstractValidator<UpdateMyAssessmentRequest>
{
    public UpdateMyAssessmentValidator(IClock clock)
    {
        RuleFor(r => r.Title).AssessmentTitle();
        RuleFor(r => r.Type).AssessmentType();
        RuleFor(r => r.WeightPercent).PercentValue();
        RuleFor(r => r.Term).TermValue();
        RuleFor(r => r.DueAt).DueWindow(() => clock.UtcNow);
        RuleFor(r => r.PredictedPercent).PercentValue();
        RuleFor(r => r.Notes).NotesValue();
        RuleFor(r => r.WeightPercent).Null().When(r => r.ClearWeightPercent).WithMessage("Send a weight or clear it, not both.");
        RuleFor(r => r.Term).Null().When(r => r.ClearTerm).WithMessage("Send a term or clear it, not both.");
        RuleFor(r => r.PredictedPercent).Null().When(r => r.ClearPredictedPercent).WithMessage("Send a prediction or clear it, not both.");
    }
}
