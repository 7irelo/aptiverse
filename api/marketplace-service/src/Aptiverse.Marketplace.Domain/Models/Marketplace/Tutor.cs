using Aptiverse.Marketplace.Domain.Models.External.Booking;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    public class Tutor
    {
        public long Id { get; set; }
        public string UserId { get; set; }
        public string Qualification { get; set; }
        public string Specialization { get; set; }
        public string Bio { get; set; }
        public decimal HourlyRate { get; set; }
        public int YearsOfExperience { get; set; }
        public string TeachingStyle { get; set; }
        public bool IsVerified { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<TutorSubject> TutorSubjects { get; set; }
        public virtual ICollection<TutorStudent> TutorStudents { get; set; }
        public virtual ICollection<Course> Courses { get; set; }
        public virtual ICollection<Resource> Resources { get; set; }
        public virtual ICollection<TutorAvailability> Availabilities { get; set; }
    }
}
