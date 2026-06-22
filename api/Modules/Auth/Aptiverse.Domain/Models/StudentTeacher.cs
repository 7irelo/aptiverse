using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Domain.Models
{
    [Index(nameof(TeacherId))]
    public class StudentTeacher
    {
        public long StudentId { get; set; }
        public Student? Student { get; set; }
        public long TeacherId { get; set; }
        public Teacher? Teacher { get; set; }
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    }
}
