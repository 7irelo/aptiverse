using FluentValidation;

namespace Aptiverse.Billing.Features.SyncPlans;

/// <summary>A single flag; the validator exists so the request goes through the same filter as every other.</summary>
internal sealed class SyncPlansValidator : AbstractValidator<SyncPlansRequest>
{
    public SyncPlansValidator()
    {
        RuleFor(r => r.DryRun).NotNull();
    }
}
