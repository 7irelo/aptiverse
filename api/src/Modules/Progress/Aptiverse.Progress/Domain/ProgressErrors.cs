using System.Globalization;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Progress.Domain;

/// <summary>Stable error codes of the Progress module (spec error table). The web switches on the code, never the text.</summary>
internal static class ProgressErrors
{
    // Same answer for "does not exist" and "belongs to someone else", so ids cannot be probed.
    public static readonly Error GoalNotFound = Error.NotFound("goal.not_found", "The goal was not found.");

    public static readonly Error StudyUnitNotFound = Error.NotFound(
        "goal.study_unit_not_found",
        "You are not enrolled in this subject or course.");

    public static readonly Error AssessmentNotFound = Error.NotFound(
        "goal.assessment_not_found",
        "The assessment was not found in this subject or course.");

    public static readonly Error AssessmentNotUpcoming = Error.Validation(
        "goal.assessment_not_upcoming",
        "Link an assessment that is still upcoming and due on or before the goal's due date.",
        new Dictionary<string, string[]> { ["assessmentId"] = ["Choose an upcoming assessment due on or before the goal's due date."] });

    public static readonly Error DuplicateActive = Error.Conflict(
        "goal.duplicate_active",
        "You already have an active goal of this kind for this subject or course.");

    public static readonly Error Locked = Error.Conflict(
        "goal.locked",
        "This goal is finished, so its criteria, target and due date can no longer change.");

    public static readonly Error VersionMismatch = Error.PreconditionFailed(
        "goal.version_mismatch",
        "This goal changed since you loaded it. Reload it and try again.");

    public static readonly Error IfMatchRequired = Error.PreconditionRequired(
        "goal.if_match_required",
        "Send the goal's ETag in the If-Match header.");

    public static readonly Error InvalidMilestones = Error.Validation(
        "goal.invalid_milestones",
        "Milestone thresholds must increase step by step and stay below the goal target.",
        new Dictionary<string, string[]> { ["milestones"] = ["Thresholds must increase step by step and stay below the target."] });

    public static readonly Error MilestoneNotFound = Error.NotFound("goal.milestone_not_found", "The milestone was not found on this goal.");

    public static readonly Error MilestoneLimit = Error.Conflict("goal.milestone_limit", "A goal can have at most 5 milestones.");

    public static readonly Error MilestoneReached = Error.Conflict(
        "goal.milestone_reached",
        "This milestone is already reached, so its threshold cannot change.");

    public static readonly Error ReorderMismatch = Error.Validation(
        "goal.reorder_mismatch",
        "The list must contain exactly your ids, each once.",
        new Dictionary<string, string[]> { ["ids"] = ["Send exactly your ids, each once."] });

    public static readonly Error UnitNotFound = Error.NotFound("progress.unit_not_found", "The subject or course was not found.");

    public static Error TargetNotAboveBaseline(decimal baseline) => Error.Conflict(
            "goal.target_not_above_baseline",
            string.Create(CultureInfo.InvariantCulture, $"Set a target above where you are now ({baseline:0.##})."))
        .With("baseline", baseline);

    public static Error ActiveLimit(int max) =>
        Error.Conflict("goal.active_limit", string.Create(CultureInfo.InvariantCulture, $"You can have at most {max} active goals."));
}
