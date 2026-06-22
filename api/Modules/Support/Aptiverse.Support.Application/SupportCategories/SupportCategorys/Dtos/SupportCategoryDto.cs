namespace Aptiverse.Support.Application.SupportCategories.Dtos
{
    public record SupportCategoryDto
    {
        public long Id { get; init; }
        public string Name { get; init; }
        public string Description { get; init; }
        public long? ParentCategoryId { get; init; }
        public bool IsActive { get; init; }
        public int SortOrder { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
