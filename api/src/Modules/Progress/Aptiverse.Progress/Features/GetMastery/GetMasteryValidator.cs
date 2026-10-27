using Aptiverse.Progress.Features.Common;
using FluentValidation;

namespace Aptiverse.Progress.Features.GetMastery;

internal sealed class GetMasteryValidator : AbstractValidator<GetMasteryRequest>
{
    public GetMasteryValidator() => RuleFor(r => r.StudyUnitId).OptionalId();
}
