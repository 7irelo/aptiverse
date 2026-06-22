using Aptiverse.Marketplace.Domain.Models.External.Identity;
using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    [Index(nameof(CourseId))]
    [Index(nameof(UserId))]
    [Index(nameof(PaymentStatus))]
    [Index(nameof(UserId), nameof(CourseId))]
    public class CourseEnrollment : IEntityTimestamps
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string UserId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentStatus { get; set; }
        public decimal Progress { get; set; }
        public DateTime? CompletedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Course Course { get; set; }
        public virtual User User { get; set; }
    }
}
