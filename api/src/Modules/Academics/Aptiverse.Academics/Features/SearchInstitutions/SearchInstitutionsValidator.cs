using Aptiverse.Academics.Domain;
using FluentValidation;

namespace Aptiverse.Academics.Features.SearchInstitutions;

internal sealed class SearchInstitutionsValidator : AbstractValidator<SearchInstitutionsRequest>
{
    public SearchInstitutionsValidator()
    {
        RuleFor(r => r.Q).Must(q => q is null || q.Trim().Length is >= 2 and <= 60)
            .WithMessage("Search must be 2 to 60 characters.");
        RuleFor(r => r.Type).Must(t => t is null || InstitutionTypes.All.Contains(t))
            .WithMessage($"Type must be one of: {string.Join(", ", InstitutionTypes.All)}.");
        RuleFor(r => r.Province).Must(p => p is null || Provinces.All.Contains(p))
            .WithMessage($"Province must be one of: {string.Join(", ", Provinces.All)}.");
        RuleFor(r => r.Limit).InclusiveBetween(1, 50);
    }
}
