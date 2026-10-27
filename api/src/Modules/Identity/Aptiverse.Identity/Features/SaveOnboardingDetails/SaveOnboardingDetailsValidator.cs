using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Identity.Features.SaveOnboardingDetails;

internal sealed class SaveOnboardingDetailsValidator : AbstractValidator<SaveOnboardingDetailsRequest>
{
    public SaveOnboardingDetailsValidator(IClock clock)
    {
        RuleFor(r => r.Grade).InclusiveBetween(8, 12).When(r => r.Grade is not null);
        RuleFor(r => r.Curriculum).Must(c => c is null || Curricula.All.Contains(c))
            .WithMessage($"Curriculum must be one of: {string.Join(", ", Curricula.All)}.");
        RuleFor(r => r.StudyLevel).Must(l => l is null || StudyLevels.All.Contains(l))
            .WithMessage($"Study level must be one of: {string.Join(", ", StudyLevels.All)}.");
        RuleFor(r => r.Programme).Programme();
        RuleFor(r => r.InstitutionName).InstitutionName();
        RuleFor(r => r.DateOfBirth).DateOfBirth(clock);
    }
}
