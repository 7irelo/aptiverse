namespace Aptiverse.Moderation.Application.ContentFilters.Dtos
{
    public record ContentFilterDto
    {
        public long Id { get; init; }
        public string FilterType { get; init; }
        public string Pattern { get; init; }
        public string Category { get; init; }
        public string Action { get; init; }
        public string Replacement { get; init; }
        public bool IsActive { get; init; }
        public string Severity { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
}
