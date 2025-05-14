using Aptiverse.Marketplace.Domain.Models.External.AcademicPlanning;
using Aptiverse.Marketplace.Domain.Models.External.Identity;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    public class Resource
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public long? UserId { get; set; }
        public long? CourseId { get; set; }
        public string? SubjectId { get; set; }
        public string ResourceType { get; set; }
        public string S3Key { get; set; }
        public string FileUrl { get; set; }
        public string FileSize { get; set; }
        public string FileFormat { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public int DownloadCount { get; set; }
        public double Rating { get; set; }
        public string GradeLevel { get; set; }
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; }
        public virtual Course Course { get; set; }
        public virtual Subject Subject { get; set; }
        public virtual ICollection<ResourceDownload> Downloads { get; set; }
    }

}
