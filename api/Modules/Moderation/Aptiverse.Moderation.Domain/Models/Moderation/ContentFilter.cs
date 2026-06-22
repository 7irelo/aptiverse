namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    public class ContentFilter
    {
        public long Id { get; set; }
        public string FilterType { get; set; }
        public string Pattern { get; set; }
        public string Category { get; set; }
        public string Action { get; set; } = "Flag";
        public string Replacement { get; set; }
        public bool IsActive { get; set; } = true;
        public string Severity { get; set; } = "Medium";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}