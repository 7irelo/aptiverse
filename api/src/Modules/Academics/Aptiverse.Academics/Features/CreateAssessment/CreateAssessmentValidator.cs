using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Academics.Features.CreateAssessment;

internal sealed class CreateAssessmentValidator : AbstractValidator<CreateAssessmentRequest>
{
    public CreateAssessmentValidator(IClock clock)
    {
        RuleFor(r => r.EnrolmentId).NotEmpty();
        RuleFor(r => r.Title).NotEmpty().AssessmentTitle();
        RuleFor(r => r.Type).NotEmpty().AssessmentType();
        RuleFor(r => r.WeightPercent).PercentValue();
        RuleFor(r => r.Term).TermValue();
        RuleFor(r => r.DueAt).NotNull().DueWindow(() => clock.UtcNow);
        RuleFor(r => r.PredictedPercent).PercentValue();
        RuleFor(r => r.Notes).NotesValue();
    }
}
