using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Domain.Models
{
    // Append-only legal record of a user agreeing to a published document
    // (terms of service, privacy policy). One row per user per document per
    // acceptance event. Rows are never updated and never deleted: when a
    // document is re-published under a new version and the user accepts it
    // again, that is a NEW row, so the full history of what was agreed and
    // when survives.
    //
    // A boolean on the user row would not be evidence of anything. What makes
    // this defensible is the pair (DocumentVersion, AcceptedAtUtc): the version
    // pins the exact text that was on screen, the timestamp pins when.
    //
    // "No acceptance on file" is simply the absence of rows. Nothing is
    // backfilled for users who signed up before this existed, because writing
    // a consent they never gave would be fabricating a legal record.
    [Table("user_consents", Schema = "identity")]
    // Lookups are always "what has this user accepted, for this document" and
    // "who accepted version X", so index both paths.
    [Index(nameof(UserId), nameof(DocumentType))]
    [Index(nameof(DocumentType), nameof(DocumentVersion))]
    public class UserConsent
    {
        public long Id { get; set; }

        // identity.users.id. Deliberately no navigation property and no
        // cascade: the consent record is evidence about an event, and it
        // should not quietly vanish because of a change to the user graph.
        public required string UserId { get; set; }

        // Which document was accepted. Values are the stable identifiers
        // "terms" and "privacy" (see ConsentDocuments in the auth service).
        public required string DocumentType { get; set; }

        // The published version of that document, as an ISO date string
        // ("2026-07-22"). This is what proves WHICH text the user agreed to.
        // Set server-side from configuration, never from the request body,
        // so a client cannot claim to have accepted a version it never saw.
        public required string DocumentVersion { get; set; }

        // When the user accepted, in UTC.
        public DateTime AcceptedAtUtc { get; set; }

        // Where the acceptance came from, e.g. "signup". Gives context when
        // re-acceptance flows (settings, forced re-consent on an update) are
        // added later.
        public required string Source { get; set; }

        // Best-effort request context at the moment of acceptance. Both are
        // nullable: they strengthen the record when present but their absence
        // must never block a consent being written.
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
