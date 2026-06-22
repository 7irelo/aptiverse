namespace Aptiverse.Moderation.Application.ContentFilters.Dtos
{
    public record CreateContentFilterDto
    {
        public string FilterType { get; init; }
        public string Pattern { get; init; }
        public string Category { get; init; }
        public string Action { get; init; }
        public string Replacement { get; init; }
        public bool IsActive { get; init; }
        public string Severity { get; init; }
    }
}
