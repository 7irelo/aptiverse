using Aptiverse.Identity.Authentication;
using FluentValidation;

namespace Aptiverse.Identity.Features.RefreshTokens;

internal sealed class RefreshTokensValidator : AbstractValidator<RefreshTokensRequest>
{
    public RefreshTokensValidator()
    {
        RuleFor(r => r.RefreshToken).Must(SecureTokens.IsWellFormed).WithMessage("The refresh token is malformed.");
    }
}
