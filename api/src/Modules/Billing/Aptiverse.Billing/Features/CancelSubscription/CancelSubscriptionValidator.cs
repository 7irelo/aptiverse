using FluentValidation;

namespace Aptiverse.Billing.Features.CancelSubscription;

internal sealed class CancelSubscriptionValidator : AbstractValidator<CancelSubscriptionRequest>
{
    public CancelSubscriptionValidator()
    {
        RuleFor(r => r.Reason).Must(r => r is null || CancelSubscriptionRequest.Reasons.Contains(r))
            .WithMessage($"Reason must be one of: {string.Join(", ", CancelSubscriptionRequest.Reasons)}.");
        RuleFor(r => r.Comment).MaximumLength(CancelSubscriptionRequest.CommentMaxLength);
    }
}
