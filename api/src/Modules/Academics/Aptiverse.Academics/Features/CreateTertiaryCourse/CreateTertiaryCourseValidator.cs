using Aptiverse.Academics.Domain;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.CreateTertiaryCourse;

internal sealed class CreateTertiaryCourseValidator : AbstractValidator<CreateTertiaryCourseRequest>
{
    public CreateTertiaryCourseValidator(IClock clock)
    {
        RuleFor(r => r.Name).NotEmpty()
            .Must(n => n is null || n.Trim().Length is >= StudyUnit.NameMinLength and <= StudyUnit.NameMaxLength)
            .WithMessage($"Name must be {StudyUnit.NameMinLength} to {StudyUnit.NameMaxLength} characters.");
        RuleFor(r => r.CourseCode)
            .Must(c => c is null || (c.Trim().Length is >= StudyUnit.CourseCodeMinLength and <= StudyUnit.CourseCodeMaxLength && c.All(IsCodeChar) && c.Any(char.IsAsciiLetterOrDigit)))
            .WithMessage($"Course code must be {StudyUnit.CourseCodeMinLength} to {StudyUnit.CourseCodeMaxLength} letters, digits, spaces or hyphens.");
        RuleFor(r => r.Level).Must(l => l is null || TertiaryLevels.All.Contains(l))
            .WithMessage($"Level must be one of: {string.Join(", ", TertiaryLevels.All)}.");
        RuleFor(r => r.Duration).Must(d => d is null || Durations.All.Contains(d))
            .WithMessage($"Duration must be one of: {string.Join(", ", Durations.All)}.");
        RuleFor(r => r.StartedOn).Must(d => d is null || StartDates.IsAllowed(d.Value, clock.UtcNow))
            .WithMessage("Start date must be within the last 6 years and at most 1 year ahead.");
        RuleFor(r => r.LecturerName).MaximumLength(Enrolment.TeacherNameMaxLength);
    }

    private static bool IsCodeChar(char c) => char.IsAsciiLetterOrDigit(c) || c is ' ' or '-';
}
