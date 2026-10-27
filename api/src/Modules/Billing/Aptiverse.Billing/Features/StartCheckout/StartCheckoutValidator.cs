using Aptiverse.Billing.Domain;
using FluentValidation;

namespace Aptiverse.Billing.Features.StartCheckout;

internal sealed class StartCheckoutValidator : AbstractValidator<StartCheckoutRequest>
{
    public StartCheckoutValidator()
    {
        RuleFor(r => r.PlanCode).NotEmpty().MaximumLength(PlanCodes.MaxLength).Matches("^[a-z0-9.]+$");
        RuleFor(r => r.Interval).NotEmpty().Must(i => Intervals.All.Contains(i))
            .WithMessage($"Interval must be one of: {string.Join(", ", Intervals.All)}.");
    }
}
