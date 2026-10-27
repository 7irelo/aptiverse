using Aptiverse.Progress.Domain;
using FluentValidation;

namespace Aptiverse.Progress.Features.Common;

/// <summary>Field rules shared by the goal validators, so create and update reject the same values.</summary>
internal static class GoalRules
{
    public static readonly TimeSpan MinLead = TimeSpan.FromDays(1);
    public static readonly TimeSpan MaxLead = TimeSpan.FromDays(366);

    public static IRuleBuilderOptions<T, string?> GoalTitle<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(t => t is null || (Clean(t).Length is >= Goal.TitleMinLength and <= Goal.TitleMaxLength && !HasControl(t)))
            .WithMessage($"Title must be {Goal.TitleMinLength} to {Goal.TitleMaxLength} characters.");

    public static IRuleBuilderOptions<T, string?> GoalDescription<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(d => d is null || (d.Trim().Length <= Goal.DescriptionMaxLength && !HasControl(d, allowNewlines: true)))
            .WithMessage($"Description must be at most {Goal.DescriptionMaxLength} characters.");

    public static IRuleBuilderOptions<T, string?> CriteriaType<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(c => c is not null && CriteriaTypes.All.Contains(c))
            .WithMessage($"Criteria type must be one of: {string.Join(", ", CriteriaTypes.All)}.");

    public static IRuleBuilderOptions<T, string?> GoalTopic<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(t => t is null || (TopicKeys.Display(t).Length is >= 1 and <= TopicKeys.MaxLength && t.Trim().Length <= TopicKeys.MaxLength && !HasControl(t)))
            .WithMessage($"Topic must be 1 to {TopicKeys.MaxLength} characters.");

    public static IRuleBuilderOptions<T, Guid?> OptionalId<T>(this IRuleBuilder<T, Guid?> rule) =>
        rule.Must(id => id != Guid.Empty).WithMessage("Id must not be empty.");

    /// <summary>Count goals take a whole number 1 to 100; score, mark and mastery goals a percent 1 to 100 (two decimals).</summary>
    public static bool IsValidTarget(string? criteriaType, decimal target) =>
        target is >= Goal.MinTarget and <= Goal.MaxTarget
        && decimal.Round(target, 2) == target
        && (criteriaType is null || !CriteriaTypes.IsCount(criteriaType) || decimal.Truncate(target) == target);

    public static bool IsValidDue(DateTimeOffset dueAt, DateTimeOffset now) => dueAt >= now + MinLead && dueAt <= now + MaxLead;

    public static IRuleBuilderOptions<T, string?> MilestoneTitle<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(t => t is not null && Clean(t).Length is >= Goal.TitleMinLength and <= Goal.TitleMaxLength && !HasControl(t))
            .WithMessage($"Milestone title must be {Goal.TitleMinLength} to {Goal.TitleMaxLength} characters.");

    public static bool IsValidThreshold(decimal threshold) =>
        threshold > 0 && threshold < Goal.MaxTarget && decimal.Round(threshold, 2) == threshold;

    private static string Clean(string text) => string.Join(' ', text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));

    private static bool HasControl(string text, bool allowNewlines = false) =>
        text.Any(c => char.IsControl(c) && !(allowNewlines && c is '\n' or '\r' or '\t'));
}
