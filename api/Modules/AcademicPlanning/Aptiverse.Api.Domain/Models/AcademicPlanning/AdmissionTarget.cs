using Microsoft.EntityFrameworkCore;
using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // What the student is actually aiming at, in the student's own words and
    // the student's own numbers.
    //
    // The design decision that matters: WE DO NOT KNOW THE REQUIREMENTS. There
    // is no catalogue of institutions, no table of APS scores, no scraped list
    // of what UCT wants for a BSc. The student researches the thing they are
    // aiming at, on the prospectus or the faculty handbook, and enters it here.
    // Institution and Programme are free text for exactly that reason.
    //
    // That is not a shortcut, it is the product. Admission requirements change
    // per institution, per faculty, per programme, per intake year, and per
    // whether the applicant is a transferring student. Any list we shipped
    // would be wrong somewhere, and a student who missed a deadline because our
    // number was stale would have been better off with no app at all. So we
    // never assert a requirement. We help the student hit a number they found
    // themselves, and SourceNote lets them record where they found it so a
    // future them can check it again.
    //
    // What the app does own is the other half: the evidence. Marks, term
    // predictions and topic mastery are ours, computed from real work. Putting
    // the student's researched target next to our measured standing is what
    // turns "I want to study medicine" into "you need 70 in Maths, you are at
    // 58, that is 12 to find".
    [Index(nameof(StudentId))]
    [Index(nameof(StudentId), nameof(Status))]
    public class AdmissionTarget : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner - FK to identity.users.id.
        public required string StudentId { get; set; }

        // Free text, as the student typed it: "University of Cape Town",
        // "Boland College". Never resolved against a seeded list, because
        // there is no seeded list.
        public required string Institution { get; set; }

        // Free text: "BSc Computer Science", "Honours in Psychology".
        public required string Programme { get; set; }

        // admission | progression. See AdmissionTargetKinds.
        public string Kind { get; set; } = AdmissionTargetKinds.Admission;

        // Progression only: what they are progressing TO. See AdmissionStages.
        // Null for an admission target, where the programme says it already.
        public string? Stage { get; set; }

        // aps | average. How to read OverallRequired. Null when the student
        // only recorded per-unit minimums, which is a legitimate target: plenty
        // of programmes gate on subject marks alone.
        public string? OverallUnit { get; set; }

        // The overall number the student researched: an APS score, or a
        // required average as a percentage.
        //
        // Note what we do NOT do with an APS figure: calculate theirs. APS is
        // scored differently by nearly every institution (some count 6
        // subjects, some 7, some exclude Life Orientation, some weight it half,
        // some run their own scale entirely). Computing a number against a
        // scale we guessed would be the exact fabrication this feature exists
        // to avoid. We store what they entered and say plainly that the tally
        // is theirs to do. An average, by contrast, we can measure honestly
        // from graded marks, and do.
        public int? OverallRequired { get; set; }

        // Application or decision deadline, when there is one.
        public DateTime? Deadline { get; set; }

        // Where the student found the requirements: "UCT prospectus 2027 p.14".
        // Their audit trail, not ours.
        public string? SourceNote { get; set; }

        // active | archived. Archived keeps a target they no longer chase
        // without deleting the history of having chased it.
        public string Status { get; set; } = AdmissionTargetStatuses.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<AdmissionRequirement> Requirements { get; set; } = [];
    }

    // One granular requirement: a single study unit and the minimum mark the
    // student researched for it. "Mathematics at 70", "Physical Science at 60".
    //
    // This is where the feature earns the word granular. An overall APS or
    // average is a blunt instrument that tells a student nothing about what to
    // do on a Tuesday. A per-subject minimum tells them exactly which subject
    // is short and by how much, which is the only form of the information that
    // can become a goal.
    [Index(nameof(AdmissionTargetId))]
    [Index(nameof(AdmissionTargetId), nameof(UnitId), IsUnique = true)]
    public class AdmissionRequirement : IEntityTimestamps
    {
        public long Id { get; set; }

        public long AdmissionTargetId { get; set; }

        // The study unit this minimum applies to, holding the same string id
        // the rest of the app keys on: a subject slug ("math") for high school,
        // a course practice key ("uct:calculus-i") for tertiary. Unified so a
        // requirement can be matched against assessments, term predictions and
        // topic mastery without caring which cohort the student is in.
        //
        // Never rendered raw. The client resolves it through
        // useAcademicUnits().nameFor, falling back to prettifyUnitId.
        public required string UnitId { get; set; }

        // The minimum mark the student researched, as a percentage.
        public int MinimumPercent { get; set; }

        // The goal generated from this requirement, once one has been.
        //
        // Stored rather than inferred so generating twice does not create
        // duplicates, and so the requirement row can show the goal's real
        // progress. Not a navigation property and not an FK constraint: Goal
        // lives in the Goals module and AcademicPlanning does not reference it.
        // The client resolves it against the goals it already has, and treats a
        // dangling id (the student deleted the goal) as simply not generated,
        // which is the truthful reading.
        public long? GoalId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual AdmissionTarget? AdmissionTarget { get; set; }
    }

    public static class AdmissionTargetKinds
    {
        // High school aiming at a university or college place: APS plus
        // subject minimums.
        public const string Admission = "admission";

        // Already studying, aiming at the next rung: next year of the degree,
        // honours, masters, PhD. Module averages and per-module minimums.
        public const string Progression = "progression";

        public static readonly string[] All = [Admission, Progression];
    }

    public static class AdmissionStages
    {
        public const string NextYear = "next_year";
        public const string Honours = "honours";
        public const string Masters = "masters";
        public const string Phd = "phd";

        public static readonly string[] All = [NextYear, Honours, Masters, Phd];
    }

    public static class AdmissionOverallUnits
    {
        // A points score the institution computes on its own scale. Recorded,
        // never calculated. See AdmissionTarget.OverallRequired.
        public const string Aps = "aps";

        // A required average as a percentage. Measurable against graded marks.
        public const string Average = "average";

        public static readonly string[] All = [Aps, Average];
    }

    public static class AdmissionTargetStatuses
    {
        public const string Active = "active";
        public const string Archived = "archived";

        public static readonly string[] All = [Active, Archived];
    }
}
