using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    // Filtered/indexed columns: filters are looked up by whether they
    // are active, by their type, by category, and by severity.
    [Index(nameof(IsActive))]
    [Index(nameof(FilterType))]
    [Index(nameof(Category))]
    [Index(nameof(Severity))]
    public class ContentFilter
    {
        public long Id { get; set; }

        // Kind of matcher (e.g. keyword/regex/phrase). Value set is not
        // documented anywhere and the property has no default, so it is
        // intentionally kept as a free-text string to guarantee
        // stored-value compatibility.
        public string FilterType { get; set; }

        public string Pattern { get; set; }

        // Open-ended classification label (profanity, spam, ...). Kept
        // as string — not a fixed closed set.
        public string Category { get; set; }

        // What to do on a match. Persisted as text via the foundation
        // enum-as-string convention; member names match the stored
        // "Flag"/"Block"/"Replace" values.
        public ContentFilterAction Action { get; set; } = ContentFilterAction.Flag;

        public string Replacement { get; set; }
        public bool IsActive { get; set; } = true;

        // Persisted as text; member names match "Low"/"Medium"/"High"/"Critical".
        public ModerationSeverity Severity { get; set; } = ModerationSeverity.Medium;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
