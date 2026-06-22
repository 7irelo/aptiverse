namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A South African FET-phase curriculum that a student can be enrolled in.
    // Seeded once at boot; not user-editable.
    //   nsc — National Senior Certificate (DBE / CAPS, public + most private)
    //   ieb — Independent Examinations Board (private schools, NSC equivalent)
    public class Curriculum
    {
        public required string Id { get; set; }     // slug: "nsc", "ieb"
        public required string Name { get; set; }
        public required string ShortName { get; set; }
        public string? Description { get; set; }

        public virtual ICollection<CurriculumSubject> CurriculumSubjects { get; set; } = [];
    }
}
