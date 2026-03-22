namespace Aptiverse.Support.Domain.Models.Support
{
    public class SupportCategory
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public long? ParentCategoryId { get; set; }
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual SupportCategory ParentCategory { get; set; }
        public virtual ICollection<SupportCategory> SubCategories { get; set; }
        public virtual ICollection<SupportTicket> Tickets { get; set; }
    }
}