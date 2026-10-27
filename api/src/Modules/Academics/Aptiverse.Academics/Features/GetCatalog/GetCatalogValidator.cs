using Aptiverse.Academics.Domain;
using FluentValidation;

namespace Aptiverse.Academics.Features.GetCatalog;

internal sealed class GetCatalogValidator : AbstractValidator<GetCatalogRequest>
{
    public GetCatalogValidator()
    {
        RuleFor(r => r.Curriculum).NotEmpty().Must(c => c is null || Curricula.All.Contains(c))
            .WithMessage($"Curriculum must be one of: {string.Join(", ", Curricula.All)}.");
        RuleFor(r => r.Grade).NotNull().InclusiveBetween(8, 12);
        RuleFor(r => r.Category).Must(c => c is null || SubjectCategories.All.Contains(c))
            .WithMessage($"Category must be one of: {string.Join(", ", SubjectCategories.All)}.");
    }
}
