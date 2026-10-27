using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using FluentValidation;

namespace Aptiverse.Identity.Features.Login;

internal sealed class LoginValidator : AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(r => r.Email).NotEmpty().MaximumLength(User.EmailMaxLength);
        RuleFor(r => r.Password).NotEmpty().MaximumLength(PasswordPolicy.MaxLength);
    }
}
