using Microsoft.EntityFrameworkCore;
using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A course/module at an institution — the tertiary equivalent of a CAPS
    // Subject. Emergent + shared per institution: the first student to add
    // "Calculus I" at UCT creates the row, everyone else at UCT reuses it, so
    // course names + practice topics stay consistent across the institution.
    //
    // Practice tests, the Topic registry and mastery all key on a single
    // string id. For a course that key is PracticeKey (institution:slug), so
    // it never collides with a CAPS subject slug or another institution's
    // course of the same name.
    [Index(nameof(InstitutionId))]
    [Index(nameof(InstitutionId), nameof(Slug), IsUnique = true)]
    public class Course : IEntityTimestamps
    {
        public long Id { get; set; }

        // FK to Institution.Id.
        public required string InstitutionId { get; set; }

        // Slugified course name, unique per institution. The dedupe key.
        public required string Slug { get; set; }

        public required string Name { get; set; }   // "Calculus I"
        public string? Code { get; set; }           // "MAM1000W" (optional)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // The string id practice generation + topic registry key on. Stable
        // and institution-scoped. Not mapped as a column — derived.
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string PracticeKey => $"{InstitutionId}:{Slug}";
    }
}
