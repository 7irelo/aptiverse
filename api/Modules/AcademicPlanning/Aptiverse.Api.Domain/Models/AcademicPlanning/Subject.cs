namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A canonical subject in the FET-phase catalog. Linked to one or more
    // curricula via CurriculumSubject. Students enrol in subjects via
    // StudentSubject.
    public class Subject
    {
        public required string Id { get; set; }      // slug: "math", "physci", "eng_hl"
        public required string Code { get; set; }    // short code shown on cards: "MATH", "PHSC"
        public required string Name { get; set; }    // "Mathematics", "Physical Sciences"

        // Category buckets used by the UI to colour-code subject cards and
        // group them in the add-subject picker.
        //   language | mathematics | natural_science | commerce |
        //   humanities | services | technical | arts | life_orientation
        public required string Category { get; set; }

        // Language-only metadata; null for non-language subjects.
        //   home | first_additional | second_additional
        public string? LanguageType { get; set; }

        public string? Description { get; set; }

        public virtual ICollection<CurriculumSubject> CurriculumSubjects { get; set; } = [];
    }
}
