using Aptiverse.Identity.Features.Common;
using FluentValidation;

namespace Aptiverse.Identity.Features.VerifyEmail;

internal sealed class VerifyEmailValidator : AbstractValidator<VerifyEmailRequest>
{
    public VerifyEmailValidator()
    {
        RuleFor(r => r.Token).OneTimeToken();
    }
}
