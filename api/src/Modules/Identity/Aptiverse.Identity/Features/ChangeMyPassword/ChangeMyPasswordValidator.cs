using Aptiverse.Identity.Authentication;
using FluentValidation;

namespace Aptiverse.Identity.Features.ChangeMyPassword;

internal sealed class ChangeMyPasswordValidator : AbstractValidator<ChangeMyPasswordRequest>
{
    public ChangeMyPasswordValidator()
    {
        RuleFor(r => r.CurrentPassword).MaximumLength(PasswordPolicy.MaxLength);
        RuleFor(r => r.NewPassword).Password();
        RuleFor(r => r.NewPassword).NotEqual(r => r.CurrentPassword, StringComparer.Ordinal)
            .WithMessage("Choose a password different from your current one.");
    }
}
