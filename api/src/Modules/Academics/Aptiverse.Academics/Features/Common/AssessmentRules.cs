using Aptiverse.Academics.Domain;
using FluentValidation;

namespace Aptiverse.Academics.Features.Common;

/// <summary>Field rules shared by creating and editing an assessment, so both enforce the same limits.</summary>
internal static class AssessmentRules
{
    public static bool IsPercent(decimal? value) => value is null || (value is >= 0m and <= 100m && decimal.Round(value.Value, 2) == value.Value);

    public static bool IsDueInWindow(DateTimeOffset dueAt, DateTimeOffset utcNow) =>
        dueAt >= utcNow.AddYears(-5) && dueAt <= utcNow.AddYears(2);

    public static IRuleBuilderOptions<T, string?> AssessmentTitle<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(t => t is null || t.Trim().Length is >= Assessment.TitleMinLength and <= Assessment.TitleMaxLength)
            .WithMessage($"Title must be {Assessment.TitleMinLength} to {Assessment.TitleMaxLength} characters.");

    public static IRuleBuilderOptions<T, string?> AssessmentType<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(t => t is null || AssessmentTypes.All.Contains(t))
            .WithMessage($"Type must be one of: {string.Join(", ", AssessmentTypes.All)}.");

    public static IRuleBuilderOptions<T, decimal?> PercentValue<T>(this IRuleBuilder<T, decimal?> rule) =>
        rule.Must(IsPercent).WithMessage("Must be between 0 and 100 with at most 2 decimals.");

    public static IRuleBuilderOptions<T, int?> TermValue<T>(this IRuleBuilder<T, int?> rule) =>
        rule.InclusiveBetween(1, 4);

    public static IRuleBuilderOptions<T, DateTimeOffset?> DueWindow<T>(this IRuleBuilder<T, DateTimeOffset?> rule, Func<DateTimeOffset> utcNow) =>
        rule.Must(d => d is null || IsDueInWindow(d.Value, utcNow()))
            .WithMessage("Due date must be within the last 5 years and at most 2 years ahead.");

    public static IRuleBuilderOptions<T, string?> NotesValue<T>(this IRuleBuilder<T, string?> rule) =>
        rule.MaximumLength(Assessment.NotesMaxLength);
}
