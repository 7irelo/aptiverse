using Aptiverse.Family.Domain;
using FluentValidation;

namespace Aptiverse.Family.Features.SendInvite;

internal sealed class SendInviteValidator : AbstractValidator<SendInviteRequest>
{
    public SendInviteValidator()
    {
        RuleFor(r => r.Email).NotEmpty().MaximumLength(Emails.MaxLength).EmailAddress();
        RuleFor(r => r.Relationship).NotEmpty().Must(r => r is not null && Relationships.All.Contains(r))
            .WithMessage("Choose mother, father, guardian or other.");
    }
}
