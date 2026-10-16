using System.ComponentModel.DataAnnotations.Schema;

namespace Aptiverse.Entitlements.Domain.Models
{
    // What points can buy.
    //
    // The rule for anything on this list: the platform must be able to deliver
    // it the instant it is redeemed, with no human in the loop and nothing to
    // ship. Every entry here is a number we already enforce, moved up for a
    // while. That is why there are no tutor hours, masterclasses or vouchers on
    // it. The old rewards page sold exactly those, priced them in points, and
    // wired the button to nothing.
    //
    // Code, not config, on purpose. These are joined to running behaviour
    // (UsageMeter reads QuotaKey; AiController charges ai.deep), so a row an
    // admin could type would let someone invent a quota key that meters nothing
    // and sell a reward that silently does nothing. Adding one should be a
    // deploy.
    // [NotMapped] because this is a value object, not a row. It lives in a
    // *.Domain.Models namespace, which is what ApplicationDbContext reflects
    // over to discover entities, so without this it gets swept into the model:
    // it has no Id, so the missing-key heuristic falls through to HasNoKey()
    // and scaffolds a primary-key-less entitlements.reward_options table that
    // nothing writes and nothing reads. The catalogue is deliberately code
    // (see above), and the only reader is RewardCatalog.All.
    [NotMapped]
    public sealed record RewardOption(
        string Code,
        string Title,
        string Description,
        string QuotaKey,
        int Bonus,
        int Days,
        int CostPoints);

    public static class RewardCatalog
    {
        public static readonly RewardOption[] All =
        [
            // Deep AI is the expensive one (Opus, extended thinking), so it is
            // priced highest and granted in the smallest amounts.
            new("deep_ai_10",
                "10 extra deep sessions",
                "Ten more deep-mode tutor sessions on top of your plan, for a week. Deep mode thinks harder and is the one to use on a hard problem or an essay.",
                "ai.deep", 10, 7, 400),

            new("deep_ai_30",
                "30 extra deep sessions",
                "Thirty more deep-mode sessions, for a fortnight. Worth saving for if exams are close.",
                "ai.deep", 30, 14, 1000),

            new("quick_ai_100",
                "100 extra quick questions",
                "A hundred more quick tutor exchanges for a week. Quick mode answers in seconds and handles most homework questions.",
                "ai.quick", 100, 7, 250),

            new("practice_15",
                "15 extra practice tests",
                "Generate fifteen more practice tests this fortnight, on any topic you choose.",
                "practice.generate", 15, 14, 300),

            new("practice_40",
                "40 extra practice tests",
                "Forty more generated tests over a month. Enough to drill a whole subject before an exam.",
                "practice.generate", 40, 30, 700),
        ];

        public static RewardOption? Find(string code) =>
            Array.Find(All, r => r.Code == code);
    }
}
