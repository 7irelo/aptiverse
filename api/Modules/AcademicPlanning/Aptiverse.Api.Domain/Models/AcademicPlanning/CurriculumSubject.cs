using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // Junction — which subjects each curriculum offers. Lets us mark a
    // subject as compulsory in one curriculum and elective in another, or
    // distinguish Advanced Programme variants (IEB has AP Maths/English).
    [Index(nameof(CurriculumId))]
    [Index(nameof(SubjectId))]
    [Index(nameof(CurriculumId), nameof(SubjectId), IsUnique = true)]
    public class CurriculumSubject
    {
        public long Id { get; set; }
        public required string CurriculumId { get; set; }
        public required string SubjectId { get; set; }

        // Compulsory means every student on this curriculum must take it
        // (e.g. Life Orientation in NSC). Compulsory subjects are pre-ticked
        // for students.
        public bool IsCompulsory { get; set; }

        public string? Notes { get; set; }

        public virtual Curriculum? Curriculum { get; set; }
        public virtual Subject? Subject { get; set; }
    }
}
