using Aptiverse.Family.Domain;
using FluentValidation;

namespace Aptiverse.Family.Features.AcceptInvite;

internal sealed class AcceptInviteValidator : AbstractValidator<AcceptInviteRequest>
{
    public AcceptInviteValidator()
    {
        RuleFor(r => r.Token).NotEmpty().Must(InviteTokens.IsWellFormed).WithMessage("The invite link is not valid.");
    }
}
