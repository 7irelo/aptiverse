using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A recognised South African tertiary institution. Seeded catalog
    // (public universities, universities of technology, public TVET
    // colleges, and major private colleges). A tertiary student picks one at
    // signup; their courses + institution-scoped practice hang off it.
    [Index(nameof(Type))]
    public class Institution
    {
        public required string Id { get; set; }        // slug: "uct", "wits", "uj"
        public required string Name { get; set; }       // "University of Cape Town"
        public string? ShortName { get; set; }          // "UCT"

        // university | university_of_technology | comprehensive_university |
        // tvet | private_college
        public required string Type { get; set; }

        public string? Province { get; set; }           // "Western Cape"
    }
}
