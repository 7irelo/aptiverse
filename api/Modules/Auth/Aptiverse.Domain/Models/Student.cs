using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Domain.Models
{
    [Index(nameof(UserId))]
    public class Student : IEntityTimestamps
    {
        public long Id { get; set; }
        public required string UserId { get; set; }
        public User? User { get; set; }
        public virtual ICollection<StudentParent> StudentParents { get; set; } = [];
        public virtual ICollection<StudentTeacher> StudentTeachers { get; set; } = [];
        public virtual ICollection<StudentAdmin> StudentAdmins { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
