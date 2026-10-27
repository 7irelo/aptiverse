namespace Aptiverse.Billing.Contracts;

/// <summary>
/// What a user is entitled to, from the database only: the free plan plus every subscription in an entitled status
/// that the user owns. A client never asserts a plan.
/// </summary>
public interface IEntitlements
{
    Task<bool> HasFeatureAsync(Guid userId, string featureKey, CancellationToken cancellationToken);

    Task<EntitlementSet> GetAsync(Guid userId, CancellationToken cancellationToken);
}

/// <param name="Features">Feature keys from every entitled plan, free included.</param>
/// <param name="PlanCodes">Codes of the entitled plans, always including "free".</param>
/// <param name="CurrentPlanCode">The paid plan the user is on, or "free".</param>
/// <param name="SubscriptionStatus">Status of the paid subscription, or null on the free plan.</param>
public sealed record EntitlementSet(
    IReadOnlyList<string> Features,
    IReadOnlyList<string> PlanCodes,
    string CurrentPlanCode,
    string? SubscriptionStatus);

/// <summary>Feature keys sold on plans. Other modules use these constants, never string literals.</summary>
public static class FeatureKeys
{
    public const string AiPractice = "ai_practice";
    public const string AiTutor = "ai_tutor";
    public const string MasteryPredictions = "mastery.predictions";
    public const string GoalsUnlimited = "goals.unlimited";
    public const string SubjectsUnlimited = "subjects.unlimited";
    public const string Workspace = "workspace";
    public const string ExamSimulator = "exam.simulator";

    /// <summary>A parent plan's per-child Student Pro cover (seats).</summary>
    public const string FamilyCover = "family.cover";

    public const int MaxLength = 60;
}
