using Aptiverse.Marketplace.Domain.Models.External.Identity;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    public class Course
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string SubjectId { get; set; }
        public string UserId { get; set; }
        public long? TutorId { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public string Level { get; set; }
        public string ThumbnailUrl { get; set; }
        public string PreviewVideoUrl { get; set; }
        public double Rating { get; set; }
        public int TotalStudents { get; set; }
        public int TotalLessons { get; set; }
        public decimal TotalHours { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; }
        public virtual Tutor Tutor { get; set; }
        public virtual ICollection<CourseModule> Modules { get; set; }
        public virtual ICollection<CourseEnrollment> Enrollments { get; set; }
        public virtual ICollection<Resource> Resources { get; set; }
    }
}
