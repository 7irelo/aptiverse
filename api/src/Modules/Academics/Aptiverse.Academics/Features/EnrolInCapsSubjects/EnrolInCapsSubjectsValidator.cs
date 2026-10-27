using Aptiverse.Academics.Domain;
using FluentValidation;

namespace Aptiverse.Academics.Features.EnrolInCapsSubjects;

internal sealed class EnrolInCapsSubjectsValidator : AbstractValidator<EnrolInCapsSubjectsRequest>
{
    public const int MaxSubjects = 12;

    public EnrolInCapsSubjectsValidator()
    {
        RuleFor(r => r.Subjects).NotNull().Must(s => s is null || s.Count is >= 1 and <= MaxSubjects)
            .WithMessage($"Choose 1 to {MaxSubjects} subjects.");
        RuleFor(r => r.Subjects).Must(s => s is null || s.Select(c => c?.SubjectId).Distinct().Count() == s.Count)
            .WithMessage("Each subject may appear only once.");
        RuleForEach(r => r.Subjects).NotNull().ChildRules(choice =>
        {
            choice.RuleFor(c => c.SubjectId).NotEmpty();
            choice.RuleFor(c => c.TeacherName).MaximumLength(Enrolment.TeacherNameMaxLength);
        });
    }
}
