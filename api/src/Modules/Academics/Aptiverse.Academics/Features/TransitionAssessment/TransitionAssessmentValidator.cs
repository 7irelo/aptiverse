using Aptiverse.Academics.Domain;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.TransitionAssessment;

internal sealed class TransitionAssessmentValidator : AbstractValidator<TransitionAssessmentRequest>
{
    public TransitionAssessmentValidator()
    {
        RuleFor(r => r.Action).NotEmpty().Must(a => a is null || TransitionActions.All.Contains(a))
            .WithMessage($"Action must be one of: {string.Join(", ", TransitionActions.All)}.");
    }
}
