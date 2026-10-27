using Aptiverse.Academics.Domain;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.SearchCourses;

internal sealed class SearchCoursesValidator : AbstractValidator<SearchCoursesRequest>
{
    public SearchCoursesValidator()
    {
        RuleFor(r => r.Q).NotEmpty().Must(q => q is null || q.Trim().Length is >= 2 and <= 60)
            .WithMessage("Search must be 2 to 60 characters.");
        RuleFor(r => r.Level).Must(l => l is null || TertiaryLevels.All.Contains(l))
            .WithMessage($"Level must be one of: {string.Join(", ", TertiaryLevels.All)}.");
        RuleFor(r => r.Limit).InclusiveBetween(1, 25);
    }
}
