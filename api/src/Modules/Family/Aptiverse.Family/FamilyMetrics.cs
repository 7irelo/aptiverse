using System.Diagnostics.Metrics;

namespace Aptiverse.Family;

/// <summary>Family counters. Tags are low-cardinality values only, never ids, emails or codes.</summary>
internal static class FamilyMetrics
{
    public const string MeterName = "Aptiverse.Family";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> InvitesSent =
        Meter.CreateCounter<long>("aptiverse.family.invites.sent", description: "Invites sent by parents");

    private static readonly Counter<long> LinksCreated =
        Meter.CreateCounter<long>("aptiverse.family.links.created", description: "Links created");

    private static readonly Counter<long> LinksRemoved =
        Meter.CreateCounter<long>("aptiverse.family.links.removed", description: "Links removed");

    private static readonly Counter<long> CodesIssued =
        Meter.CreateCounter<long>("aptiverse.family.link_codes.issued", description: "Link codes issued to students");

    private static readonly Counter<long> CodeFailures =
        Meter.CreateCounter<long>("aptiverse.family.link_codes.failures", description: "Wrong or blocked link code redemptions");

    private static readonly Counter<long> ConsentChanges =
        Meter.CreateCounter<long>("aptiverse.family.consent.changed", description: "Parental consent granted or withdrawn");

    private static readonly Counter<long> HiddenBlocks =
        Meter.CreateCounter<long>("aptiverse.family.summary.block_hidden", description: "Summary blocks the student did not share");

    public static void InviteSent() => InvitesSent.Add(1);

    public static void LinkCreated(string method) => LinksCreated.Add(1, new KeyValuePair<string, object?>("method", method));

    public static void LinkRemoved(string removedBy) => LinksRemoved.Add(1, new KeyValuePair<string, object?>("removed_by", removedBy));

    public static void CodeIssued() => CodesIssued.Add(1);

    /// <param name="outcome">"wrong", "expired" or "blocked".</param>
    public static void CodeFailed(string outcome) => CodeFailures.Add(1, new KeyValuePair<string, object?>("outcome", outcome));

    public static void ConsentChanged(string action) => ConsentChanges.Add(1, new KeyValuePair<string, object?>("action", action));

    public static void BlockHidden(string scope) => HiddenBlocks.Add(1, new KeyValuePair<string, object?>("scope", scope));
}
