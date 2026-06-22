namespace Aptiverse.Sales.Domain.Models
{
    // A lead captured from the "Contact sales" form on the public site.
    // Anonymous (no UserId) since schools fill this in before they have
    // an account. Sales picks it up from the admin dashboard.
    //
    // Auto-discovered into the 'sales' schema by ApplicationDbContext —
    // table is 'school_enquiries' (snake_case + pluralised).
    public class SchoolEnquiry
    {
        public long Id { get; set; }

        // Required school + contact details. Validated server-side too;
        // the form does it client-side first.
        public required string SchoolName { get; set; }
        public required string ContactName { get; set; }
        public string? ContactRole { get; set; }
        public required string Email { get; set; }
        public string? Phone { get; set; }

        // Where the school is — used for routing leads to the right
        // regional sales contact later.
        public string? Province { get; set; }
        public string? City { get; set; }

        // Comma-separated curriculum codes (nsc, ieb, cambridge). Free-text
        // so the schema doesn't get in the way if a school answers
        // "we do all three".
        public string? Curricula { get; set; }

        // Range strings, not exact counts — "150-499", "500+", etc.
        // Schools rarely know exact numbers when filling this form.
        public string? LearnerCount { get; set; }

        // exploring | demo | pilot | ready
        public string? Stage { get; set; }

        public string? Notes { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Sales sets this once they make contact, so we can filter the
        // admin list to fresh enquiries.
        public bool Contacted { get; set; }
        public DateTime? ContactedAt { get; set; }
    }
}
