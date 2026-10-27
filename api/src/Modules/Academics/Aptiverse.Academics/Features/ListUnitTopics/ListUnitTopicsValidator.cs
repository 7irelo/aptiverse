using FluentValidation;

namespace Aptiverse.Academics.Features.ListUnitTopics;

internal sealed class ListUnitTopicsValidator : AbstractValidator<ListUnitTopicsRequest>
{
    public ListUnitTopicsValidator()
    {
        RuleFor(r => r.Q).Must(q => q is null || q.Trim().Length is >= 1 and <= 60)
            .WithMessage("Search must be 1 to 60 characters.");
        RuleFor(r => r.Limit).InclusiveBetween(1, 200);
    }
}
