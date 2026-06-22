namespace Aptiverse.Sales.Domain.Models
{
    // A general enquiry captured from the public "Contact us" form.
    // Anonymous (no UserId) — anyone on the marketing site can submit,
    // before they have an account. Support/sales picks it up from the
    // admin dashboard, same as SchoolEnquiry.
    //
    // Auto-discovered into the 'sales' schema by ApplicationDbContext —
    // table is 'contact_enquiries' (snake_case + pluralised). No DbSet or
    // Fluent config needed; reflection discovery handles it because this
    // class lives in Aptiverse.Sales.Domain.Models.
    public class ContactEnquiry
    {
        public long Id { get; set; }

        // Required contact details. Validated server-side too; the form
        // does it client-side first.
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }

        // Optional — individuals (not just orgs) use the contact form.
        public string? Organisation { get; set; }

        // Why they're reaching out. Free-text so the schema doesn't get in
        // the way (sales | support | partnership | media | other, etc.).
        public required string Reason { get; set; }

        // The body of the enquiry.
        public required string Message { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Support/sales sets this once they make contact, so we can filter
        // the admin list to fresh enquiries.
        public bool Contacted { get; set; }
        public DateTime? ContactedAt { get; set; }
    }
}
