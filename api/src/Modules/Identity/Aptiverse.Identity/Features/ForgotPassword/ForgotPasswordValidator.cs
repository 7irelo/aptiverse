using Aptiverse.Identity.Domain;
using FluentValidation;

namespace Aptiverse.Identity.Features.ForgotPassword;

internal sealed class ForgotPasswordValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordValidator()
    {
        RuleFor(r => r.Email).NotEmpty().MaximumLength(User.EmailMaxLength);
    }
}
