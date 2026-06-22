using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Support.Domain.Models.Support
{
    // Catalog of support categories (hierarchical). Filtered by IsActive
    // for the picker and self-joined on ParentCategoryId for the tree.
    // Treated as a catalog/config entity, so timestamps are left as-is
    // (only the existing CreatedAt) rather than adopting IEntityTimestamps.
    [Index(nameof(ParentCategoryId))]
    [Index(nameof(IsActive))]
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
