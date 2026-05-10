using Aptiverse.Marketplace.Domain.Models.External.Identity;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    public class CourseEnrollment
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public long UserId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentStatus { get; set; }
        public decimal Progress { get; set; }
        public DateTime? CompletedAt { get; set; }

        public virtual Course Course { get; set; }
        public virtual User User { get; set; }
    }
}
