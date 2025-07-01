using Aptiverse.Marketplace.Domain.Models.External.Identity;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    public class ResourceDownload
    {
        public long Id { get; set; }
        public long ResourceId { get; set; }
        public long UserId { get; set; }
        public DateTime DownloadedAt { get; set; }

        public virtual Resource Resource { get; set; }
        public virtual User User { get; set; }
    }
}
