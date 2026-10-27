using Aptiverse.Identity.Features.Common;
using FluentValidation;

namespace Aptiverse.Identity.Features.AcceptConsents;

internal sealed class AcceptConsentsValidator : AbstractValidator<AcceptConsentsRequest>
{
    public AcceptConsentsValidator()
    {
        RuleFor(r => r.TermsVersion).NotEmpty().MaximumLength(IdentityRules.ConsentVersionMaxLength);
        RuleFor(r => r.PrivacyVersion).NotEmpty().MaximumLength(IdentityRules.ConsentVersionMaxLength);
    }
}
