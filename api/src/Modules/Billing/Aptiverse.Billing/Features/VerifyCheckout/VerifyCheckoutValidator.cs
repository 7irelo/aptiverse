using Aptiverse.Billing.Domain;
using FluentValidation;

namespace Aptiverse.Billing.Features.VerifyCheckout;

internal sealed class VerifyCheckoutValidator : AbstractValidator<VerifyCheckoutRequest>
{
    public VerifyCheckoutValidator()
    {
        RuleFor(r => r.Reference).NotEmpty().MaximumLength(CheckoutSession.ReferenceMaxLength).Matches("^[A-Za-z0-9_.=-]+$");
    }
}
