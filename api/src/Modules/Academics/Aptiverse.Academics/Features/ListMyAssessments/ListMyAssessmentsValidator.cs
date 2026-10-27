using Aptiverse.Academics.Domain;
using Aptiverse.SharedKernel.Paging;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.ListMyAssessments;

internal sealed class ListMyAssessmentsValidator : AbstractValidator<ListMyAssessmentsRequest>
{
    public const int MaxRangeDays = 400;

    public static IReadOnlyList<string> Sorts { get; } = ["due_asc", "due_desc"];

    public ListMyAssessmentsValidator()
    {
        RuleFor(r => r.EnrolmentId).Must(id => id != Guid.Empty).WithMessage("Enrolment id must not be empty.");
        RuleFor(r => r.State).Must(s => s is null || (s.Length <= AssessmentStates.All.Count && s.All(AssessmentStates.All.Contains)))
            .WithMessage($"State must be one of: {string.Join(", ", AssessmentStates.All)}.");
        RuleFor(r => r.Type).Must(t => t is null || AssessmentTypes.All.Contains(t))
            .WithMessage($"Type must be one of: {string.Join(", ", AssessmentTypes.All)}.");
        RuleFor(r => r.Sort).Must(s => s is null || Sorts.Contains(s))
            .WithMessage($"Sort must be one of: {string.Join(", ", Sorts)}.");
        RuleFor(r => r.To).Must((r, to) => r.From is null || to is null || to.Value >= r.From.Value)
            .WithMessage("To must be on or after From.");
        RuleFor(r => r.To).Must((r, to) => r.From is null || to is null || to.Value.DayNumber - r.From.Value.DayNumber <= MaxRangeDays)
            .WithMessage($"The range can span at most {MaxRangeDays} days.");
        RuleFor(r => r.Page).GreaterThanOrEqualTo(1);
        RuleFor(r => r.PageSize).InclusiveBetween(1, PageRequest.MaxPageSize);
    }
}
