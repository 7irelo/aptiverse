using Aptiverse.Family.Domain;
using FluentValidation;

namespace Aptiverse.Family.Features.GrantConsent;

internal sealed class GrantConsentValidator : AbstractValidator<GrantConsentRequest>
{
    public GrantConsentValidator()
    {
        RuleFor(r => r.DocumentVersion).NotEmpty().MaximumLength(ParentalConsentRecord.DocumentVersionMaxLength);
        RuleFor(r => r.ConfirmIsParentOrGuardian).Equal(true).WithMessage("Confirm that you are this child's parent or legal guardian.");
    }
}
