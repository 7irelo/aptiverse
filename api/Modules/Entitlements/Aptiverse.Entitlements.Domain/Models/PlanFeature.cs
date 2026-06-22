using System.ComponentModel.DataAnnotations.Schema;

namespace Aptiverse.Entitlements.Domain.Models
{
    // Junction between Plan and feature keys. Feature keys are free-text
    // identifiers ("ai_practice.unlimited", "parent.dashboard") that the
    // frontend FeatureGuard and backend [RequiresFeature] both consume.
    //
    // Free-text rather than a strongly-typed enum so adding a feature
    // doesn't require code changes everywhere — the catalog seeder is
    // the single point that defines the canonical set.
    public class PlanFeature
    {
        public long Id { get; set; }
        public required string PlanCode { get; set; }
        public required string FeatureKey { get; set; }

        [ForeignKey(nameof(PlanCode))]
        public virtual Plan? Plan { get; set; }
    }
}
