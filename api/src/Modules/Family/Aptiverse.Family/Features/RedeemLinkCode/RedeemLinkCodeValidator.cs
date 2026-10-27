using Aptiverse.Family.Domain;
using FluentValidation;

namespace Aptiverse.Family.Features.RedeemLinkCode;

internal sealed class RedeemLinkCodeValidator : AbstractValidator<RedeemLinkCodeRequest>
{
    public RedeemLinkCodeValidator()
    {
        // Only the shape is checked here; a well formed wrong code counts as a failed attempt in the handler.
        RuleFor(r => r.Code).NotEmpty().MaximumLength(LinkCodes.MaxInputLength)
            .Must(c => LinkCodes.Normalize(c) is not null).WithMessage("Enter the 12 character code, for example 7K3Q-9XWM-2HCD.");
        RuleFor(r => r.Relationship).NotEmpty().Must(r => r is not null && Relationships.All.Contains(r))
            .WithMessage("Choose mother, father, guardian or other.");
    }
}
