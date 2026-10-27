using Aptiverse.Identity.Features.Common;
using FluentValidation;

namespace Aptiverse.Identity.Features.GoogleSignIn;

internal sealed class GoogleSignInValidator : AbstractValidator<GoogleSignInRequest>
{
    public GoogleSignInValidator()
    {
        RuleFor(r => r.IdToken).NotEmpty().MaximumLength(IdentityRules.GoogleTokenMaxLength);
    }
}
