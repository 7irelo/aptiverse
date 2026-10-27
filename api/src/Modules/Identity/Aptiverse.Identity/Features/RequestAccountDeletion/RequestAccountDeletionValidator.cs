using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using FluentValidation;

namespace Aptiverse.Identity.Features.RequestAccountDeletion;

internal sealed class RequestAccountDeletionValidator : AbstractValidator<RequestAccountDeletionRequest>
{
    public const string ConfirmationText = "DELETE";

    public RequestAccountDeletionValidator()
    {
        RuleFor(r => r.Confirm).Equal(ConfirmationText, StringComparer.Ordinal).WithMessage("Type DELETE to confirm.");
        RuleFor(r => r.CurrentPassword).MaximumLength(PasswordPolicy.MaxLength);
        RuleFor(r => r.Reason).MaximumLength(AccountDeletionRequest.ReasonMaxLength)
            .Must(r => r is null || !r.Any(c => char.IsControl(c) && c is not '\n' and not '\r' and not '\t'))
            .WithMessage("The reason contains characters that are not allowed.");
    }
}
