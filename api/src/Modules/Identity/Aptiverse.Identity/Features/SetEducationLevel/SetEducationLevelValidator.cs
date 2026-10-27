using Aptiverse.Identity.Domain;
using FluentValidation;

namespace Aptiverse.Identity.Features.SetEducationLevel;

internal sealed class SetEducationLevelValidator : AbstractValidator<SetEducationLevelRequest>
{
    public SetEducationLevelValidator()
    {
        RuleFor(r => r.EducationLevel).Must(level => EducationLevels.All.Contains(level))
            .WithMessage($"Education level must be one of: {string.Join(", ", EducationLevels.All)}.");
    }
}
