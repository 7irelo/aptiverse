using Aptiverse.Academics.Domain;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.UpdateMyUnit;

internal sealed class UpdateMyUnitValidator : AbstractValidator<UpdateMyUnitRequest>
{
    public UpdateMyUnitValidator(IClock clock)
    {
        RuleFor(r => r.TeacherName).MaximumLength(Enrolment.TeacherNameMaxLength);
        RuleFor(r => r.Duration).Must(d => d is null || Durations.All.Contains(d))
            .WithMessage($"Duration must be one of: {string.Join(", ", Durations.All)}.");
        RuleFor(r => r.StartedOn).Must(d => d is null || StartDates.IsAllowed(d.Value, clock.UtcNow))
            .WithMessage("Start date must be within the last 6 years and at most 1 year ahead.");
        RuleFor(r => r.ColourToken).Must(c => c is null || ColourTokens.All.Contains(c))
            .WithMessage($"Colour must be one of: {string.Join(", ", ColourTokens.All)}.");
        RuleFor(r => r.DisplayOrder).InclusiveBetween(0, Enrolment.MaxDisplayOrder);
    }
}
