using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using FluentValidation;

namespace Aptiverse.Identity.Features.Register;

internal sealed class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(r => r.Name).PersonName();
        RuleFor(r => r.Email).AccountEmail();
        RuleFor(r => r.Password).Password();
        RuleFor(r => r.Password)
            .Must((r, password) => !string.Equals(password?.Trim(), r.Email?.Trim(), StringComparison.OrdinalIgnoreCase))
            .WithMessage("Choose a password that is not your email address.");
        RuleFor(r => r.Role).Must(role => Roles.SelfRegistrable.Contains(role))
            .WithMessage($"Role must be one of: {string.Join(", ", Roles.SelfRegistrable)}.");
        RuleFor(r => r.AcceptedTermsVersion).NotEmpty().MaximumLength(IdentityRules.ConsentVersionMaxLength);
        RuleFor(r => r.AcceptedPrivacyVersion).NotEmpty().MaximumLength(IdentityRules.ConsentVersionMaxLength);
    }
}
