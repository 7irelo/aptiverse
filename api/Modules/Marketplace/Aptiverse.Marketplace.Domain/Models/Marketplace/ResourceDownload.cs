using Aptiverse.Marketplace.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    [Index(nameof(ResourceId))]
    [Index(nameof(UserId))]
    [Index(nameof(UserId), nameof(ResourceId))]
    public class ResourceDownload
    {
        public long Id { get; set; }
        public long ResourceId { get; set; }
        public string UserId { get; set; }
        public DateTime DownloadedAt { get; set; }

        public virtual Resource Resource { get; set; }
        public virtual User User { get; set; }
    }
}
