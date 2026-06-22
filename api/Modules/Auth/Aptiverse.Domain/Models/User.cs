using Microsoft.AspNetCore.Identity;

namespace Aptiverse.Domain.Models
{
    public class User : IdentityUser
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        // FET-phase academic profile. Populated lazily — the user picks a
        // curriculum the first time they add a subject (or via settings).
        // Until then both are null and the dashboard shows the curriculum
        // picker on /dashboard/subjects.
        public string? CurriculumId { get; set; }   // e.g. "nsc", "ieb"
        public int? Grade { get; set; }              // 10, 11, or 12

        // Optional school the student attends. Free text for now — we don't
        // maintain a schools registry. Useful for context on teacher/parent
        // dashboards and for school-side reporting later.
        public string? School { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
