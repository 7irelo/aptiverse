using Aptiverse.Practice.Domain;
using FluentValidation;

namespace Aptiverse.Practice.Features.ReportFocusLoss;

internal sealed class ReportFocusLossValidator : AbstractValidator<ReportFocusLossRequest>
{
    public ReportFocusLossValidator()
    {
        RuleFor(r => r.Kind).NotEmpty().Must(k => FocusLossKinds.All.Contains(k))
            .WithMessage($"Kind must be one of: {string.Join(", ", FocusLossKinds.All)}.");
    }
}
