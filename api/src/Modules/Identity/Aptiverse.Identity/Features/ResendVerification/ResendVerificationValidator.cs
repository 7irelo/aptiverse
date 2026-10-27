using Aptiverse.Identity.Features.Common;
using FluentValidation;

namespace Aptiverse.Identity.Features.ResendVerification;

internal sealed class ResendVerificationValidator : AbstractValidator<ResendVerificationRequest>
{
    public ResendVerificationValidator()
    {
        RuleFor(r => r.Email).AccountEmail().When(r => r.Email is not null);
    }
}
