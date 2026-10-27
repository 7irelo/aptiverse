using Aptiverse.Billing.Domain;
using FluentValidation;

namespace Aptiverse.Billing.Features.ListPlans;

internal sealed class ListPlansValidator : AbstractValidator<ListPlansRequest>
{
    public ListPlansValidator()
    {
        RuleFor(r => r.Audience).Must(a => a is null || Audiences.All.Contains(a))
            .WithMessage($"Audience must be one of: {string.Join(", ", Audiences.All)}.");
    }
}
