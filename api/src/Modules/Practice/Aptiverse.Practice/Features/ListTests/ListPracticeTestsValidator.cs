using Aptiverse.Practice.Domain;
using FluentValidation;

namespace Aptiverse.Practice.Features.ListTests;

internal sealed class ListPracticeTestsValidator : AbstractValidator<ListPracticeTestsRequest>
{
    public ListPracticeTestsValidator()
    {
        RuleFor(r => r.StudyUnitId).Must(id => id != Guid.Empty).WithMessage("Study unit id must not be empty.");
        RuleFor(r => r.Status).Must(s => s is null || TestStatuses.All.Contains(s))
            .WithMessage($"Status must be one of: {string.Join(", ", TestStatuses.All)}.");
        RuleFor(r => r.Page).InclusiveBetween(1, 10_000);
        RuleFor(r => r.PageSize).InclusiveBetween(1, ListPracticeTestsRequest.MaxPageSize);
    }
}
