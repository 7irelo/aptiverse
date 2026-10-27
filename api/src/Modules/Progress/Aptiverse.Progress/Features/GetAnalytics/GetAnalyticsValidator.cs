using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.GetAnalytics;

internal sealed class GetAnalyticsValidator : AbstractValidator<GetAnalyticsRequest>
{
    public static readonly IReadOnlyList<int> Ranges = [7, 28, 90];

    public GetAnalyticsValidator() =>
        RuleFor(r => r.RangeDays).Must(d => Ranges.Contains(d)).WithMessage("Range must be 7, 28 or 90 days.");
}
