namespace Aptiverse.Audit.Domain.Models.Audit
{
    // Closed severity classification for an audit action / log entry.
    // The cross-cutting EF convention persists this enum AS A STRING,
    // so the DB column stays text. Member names are PascalCase and must
    // match the string values already stored (the seeded default is
    // "Info"). If a producer needs a new severity, add a member here.
    public enum AuditSeverity
    {
        Info,
        Warning,
        Error,
        Critical
    }
}
