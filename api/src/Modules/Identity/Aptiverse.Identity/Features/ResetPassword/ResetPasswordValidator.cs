using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Features.Common;
using FluentValidation;

namespace Aptiverse.Identity.Features.ResetPassword;

internal sealed class ResetPasswordValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordValidator()
    {
        RuleFor(r => r.Token).OneTimeToken();
        RuleFor(r => r.NewPassword).Password();
    }
}
