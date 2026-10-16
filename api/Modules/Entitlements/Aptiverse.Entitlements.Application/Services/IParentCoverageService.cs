namespace Aptiverse.Entitlements.Application.Services
{
    // Parent-covers-children model. A parent covers each linked child with a
    // dedicated "coverage" subscription: one Subscription per (parent, child)
    // owned by the parent, on student.pro (default) or student.max (upgraded),
    // whose single member is the child. Because effective features are the
    // union across all active memberships, this grants the child Pro / Max
    // without touching the parent's own subscription.
    //
    // A child's coverage sub is identified as: a Subscription owned by the
    // parent whose PlanCode is student.pro or student.max and which has a
    // SubscriptionMember for that child. There is exactly ONE per (parent,
    // child); upgrading / downgrading mutates its PlanCode, it never creates a
    // second row.
    public interface IParentCoverageService
    {
        // Create the coverage sub at planCode if none exists for this
        // (parent, child), otherwise set the existing sub's PlanCode.
        Task EnsureCoverageAsync(string parentId, string childId, string planCode, CancellationToken ct = default);

        // "student.pro" / "student.max" for the child's active coverage sub,
        // or null when the parent does not cover this child.
        Task<string?> GetChildPlanAsync(string parentId, string childId, CancellationToken ct = default);

        // How many children this parent currently covers (active coverage subs).
        Task<int> CoveredCountAsync(string parentId, CancellationToken ct = default);

        // MaxMembers of this parent's highest active parent.* subscription, or
        // 0 when they hold no paid parent plan. Coverage hands out a real paid
        // student plan, so "no parent plan" must mean "no capacity", never
        // unlimited.
        Task<int> ChildCapacityAsync(string parentId, CancellationToken ct = default);

        // True when the parent may cover one more child at this moment: they
        // hold a paid parent plan and have not used up its capacity. Already
        // covering this child counts as allowed, since re-covering is a no-op
        // tier change rather than a new seat.
        Task<bool> CanCoverAsync(string parentId, string childId, CancellationToken ct = default);
    }
}
