namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A subject the student is currently enrolled in. Created when the
    // student clicks "Add subject" and picks from the canonical list for
    // their curriculum. Marks/predictions are derived from logged SBA
    // tasks (separate module — not stored here).
    public class StudentSubject
    {
        public long Id { get; set; }

        // FK to identity.users (string Identity Id). Indexed.
        public required string StudentId { get; set; }

        // FK to the curriculum-subject row the student picked — captures
        // both the canonical subject and which curriculum variant they're
        // taking (an IEB Maths student is on a different syllabus from an
        // NSC Maths student).
        public long CurriculumSubjectId { get; set; }

        // 10, 11, or 12 at the time of enrolment. Lets us track progression
        // across years without rewriting history.
        public int Grade { get; set; }

        // Optional teacher name — students can fill this in to make the
        // subject card feel personal, but it's not required.
        public string? Teacher { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual CurriculumSubject? CurriculumSubject { get; set; }
    }
}
