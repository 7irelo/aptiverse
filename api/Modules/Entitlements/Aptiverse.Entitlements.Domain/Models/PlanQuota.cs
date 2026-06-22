using System.ComponentModel.DataAnnotations.Schema;

namespace Aptiverse.Entitlements.Domain.Models
{
    // Forced table name — Humanizer's Pluralize() treats "Quota" as
    // already-plural (Latin-style, like "data"/"media"), so the auto-
    // discovered name comes out singular. Override explicitly for
    // consistency with the rest of the schema (plans, plan_features).
    [Table("plan_quotas", Schema = "entitlements")]
    // How much of a metered feature (AI calls, WhatsApp messages, etc.)
    // a Plan includes per calendar month. Seeded from the marketing
    // pricing page. -1 = unlimited.
    //
    // Quota keys are free-text identifiers:
    //   "ai.quick"   — Claude Haiku exchanges (help bot, short tutor)
    //   "ai.deep"    — Claude Sonnet sessions (essay marking, walk-throughs)
    //   "whatsapp"   — WhatsApp Business messages
    // The frontend pricing page surfaces these as "Quick AI / Deep AI /
    // WhatsApp" allowances.
    public class PlanQuota
    {
        public long Id { get; set; }
        public required string PlanCode { get; set; }
        public required string QuotaKey { get; set; }

        // -1 means unlimited (subject to fair-use enforcement at higher
        // levels — e.g. abuse rate limiting on the HTTP layer).
        public int PerMonth { get; set; }

        [ForeignKey(nameof(PlanCode))]
        public virtual Plan? Plan { get; set; }
    }
}
