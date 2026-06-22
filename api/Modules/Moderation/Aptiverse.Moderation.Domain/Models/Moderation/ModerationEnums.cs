namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    // Closed-set enums for the Moderation module. The foundation
    // OnModelCreating convention persists every enum property as a
    // string (HasConversion<string>()), so the underlying Postgres
    // columns STAY text and the stored values are the enum member
    // names verbatim. Member names below are chosen to match the
    // PascalCase string values the entities currently default to and
    // round-trip through AutoMapper (string DTO <-> enum domain) by
    // name, so this change is value-string compatible.

    // ContentReport.Status — workflow state of a report.
    // Existing default value: "Pending".
    public enum ModerationReportStatus
    {
        Pending,
        Reviewing,
        Resolved,
        Dismissed
    }

    // Shared severity scale for ContentReport and ContentFilter.
    // Existing default value: "Medium".
    public enum ModerationSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    // ContentFilter.Action — what the filter does on a match.
    // Existing default value: "Flag".
    public enum ContentFilterAction
    {
        Flag,
        Block,
        Replace
    }
}
