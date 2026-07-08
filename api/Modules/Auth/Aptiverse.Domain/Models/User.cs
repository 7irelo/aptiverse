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

        // Which academic world the student is in — chosen at signup. Decides
        // where their subjects come from: "highschool" uses the shared CAPS
        // catalog (curriculum + grade), "tertiary" lets them create their own
        // subjects/modules. Defaults to highschool for existing rows.
        public string EducationLevel { get; set; } = "highschool";  // highschool | tertiary

        // Tertiary students only: the institution they picked at signup (FK to
        // AcademicPlanning.Institution.Id). Null for high-school students, who
        // use CurriculumId + Grade instead. Their courses + institution-scoped
        // practice hang off this.
        public string? InstitutionId { get; set; }

        // Optional school the student attends. Free text for now — we don't
        // maintain a schools registry. Useful for context on teacher/parent
        // dashboards and for school-side reporting later.
        public string? School { get; set; }

        // Notification preferences. In-app notifications are always on; these
        // gate the optional email/push channels and which categories fire.
        //
        // Channel masters: EmailNotifications gates every email we send the
        // student (a category can only email if this is on too); Push is stored
        // for when a push transport exists.
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;

        // Study-group session reminders by email. Opt-in (default false) so we
        // never surprise a student with email until they ask for it.
        public bool StudyGroupEmailReminders { get; set; }

        // Assessment due-soon reminders by email. Opt-in (default false): the
        // in-app reminder is on by default (AssessmentDueReminders below), but
        // the email channel for it is off until the student turns it on.
        public bool AssessmentDueEmailReminders { get; set; }

        // Category preferences. Defaults mirror the old UI defaults. Consumers
        // for the daily/weekly ones land as those jobs are built; the
        // preference is stored and honoured the moment they do.
        public bool WellbeingCheckinReminders { get; set; } = true;
        public bool AssessmentDueReminders { get; set; } = true;
        public bool WeeklyStudySummary { get; set; }

        // Tracking state (not a preference): the UTC time we last sent the
        // daily wellbeing check-in nudge, so the poller fires at most once per
        // day. Null until the first reminder ever goes out.
        public DateTime? LastWellbeingReminderAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
