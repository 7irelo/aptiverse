using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    // A parent promising their child money for hitting a goal, and a record of
    // whether it got paid.
    //
    // Aptiverse does not touch the money. It holds no funds, moves nothing, and
    // takes no cut: this is a pledge and a receipt, settled between a parent and
    // their child however they already settle pocket money. That boundary is the
    // whole design, not a limitation to remove later. The moment we hold a
    // parent's money for a child we are a deposit-taking business with the
    // licensing that implies, and an allowance is not worth becoming that.
    //
    // What the platform is actually good for here is the honest part: the
    // parent cannot fudge whether the goal was met, and neither can the child.
    // Status only reaches Earned when GoalEvaluator verifies the goal against
    // real evidence, so nobody argues about whether it counted. Paid is the
    // parent's own word, because only they know if the cash changed hands.
    [Index(nameof(GoalId))]
    [Index(nameof(StudentId))]
    [Index(nameof(SponsorUserId))]
    [Index(nameof(Status))]
    [Index(nameof(StudentId), nameof(Status))]
    public class GoalAllowance : IEntityTimestamps
    {
        public long Id { get; set; }

        public long GoalId { get; set; }

        // identity.users.id of the child the goal belongs to. Denormalised off
        // Goal.StudentId so a student's allowances can be read without joining
        // through goals they might have deleted.
        public string StudentId { get; set; } = "";

        // identity.users.id of the parent who pledged, plus their name at the
        // time. Snapshotted so the child still sees who promised it if the
        // parent later renames or the link is revoked.
        public string SponsorUserId { get; set; } = "";
        public string SponsorName { get; set; } = "";

        // Rand. decimal, never double: money that rounds itself is money that
        // starts arguments.
        public decimal AmountZar { get; set; }

        // pledged   — promised, goal not yet achieved
        // earned    — the system verified the goal; the parent owes it
        // paid      — the parent says they handed it over
        // cancelled — withdrawn before it was earned
        public string Status { get; set; } = AllowanceStatuses.Pledged;

        // When the goal was verified, and when the parent marked it settled.
        public DateTime? EarnedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        // Optional note from the parent, shown to the child with the pledge.
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Goal? Goal { get; set; }
    }

    public static class AllowanceStatuses
    {
        public const string Pledged = "pledged";
        public const string Earned = "earned";
        public const string Paid = "paid";
        public const string Cancelled = "cancelled";
    }
}
