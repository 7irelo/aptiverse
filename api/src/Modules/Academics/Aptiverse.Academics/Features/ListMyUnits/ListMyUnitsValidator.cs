using FluentValidation;

namespace Aptiverse.Academics.Features.ListMyUnits;

internal sealed class ListMyUnitsValidator : AbstractValidator<ListMyUnitsRequest>
{
    public static IReadOnlyList<string> Filters { get; } = ["active", "completed", "all"];

    public ListMyUnitsValidator()
    {
        RuleFor(r => r.Status).Must(s => s is null || Filters.Contains(s))
            .WithMessage($"Status must be one of: {string.Join(", ", Filters)}.");
    }
}
