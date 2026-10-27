using Aptiverse.Academics.Domain;
using FluentValidation;
using Microsoft.AspNetCore.Builder;

namespace Aptiverse.Academics.Features.RecordAssessmentMark;

internal sealed class RecordAssessmentMarkValidator : AbstractValidator<RecordAssessmentMarkRequest>
{
    public RecordAssessmentMarkValidator()
    {
        RuleFor(r => r)
            .Must(r => (r.Percent is null && r.MarkObtained is not null && r.MarkTotal is not null)
                || (r.Percent is not null && r.MarkObtained is null && r.MarkTotal is null))
            .WithName("mark")
            .WithMessage("Send either markObtained with markTotal, or percent on its own.");
        RuleFor(r => r.MarkObtained).InclusiveBetween(0, Assessment.MaxMark);
        RuleFor(r => r.MarkTotal).InclusiveBetween(1, Assessment.MaxMark);
        RuleFor(r => r.MarkObtained)
            .Must((r, obtained) => obtained is null || r.MarkTotal is null || obtained <= r.MarkTotal)
            .WithMessage("The mark obtained cannot be more than the total.");
        RuleFor(r => r.Percent).InclusiveBetween(0, 100);
    }
}
