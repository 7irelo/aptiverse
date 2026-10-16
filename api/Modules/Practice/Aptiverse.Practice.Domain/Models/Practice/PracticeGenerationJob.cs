using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // A queued request to generate a practice test with Claude.
    //
    // Generation is four to six Anthropic round trips and can run for a minute
    // on a full exam paper. It used to run inline inside the POST handler,
    // which held a request thread for that whole time. Production is a single
    // t3.micro with two burstable vCPUs and 1 GiB of RAM shared with Redis, so
    // one student generating a paper starved every other request on the box and
    // burned the CPU credits that keep it responsive at all.
    //
    // So the request now only validates, meters and writes one of these rows,
    // and PracticeGenerationWorker does the actual work off the request path,
    // one job at a time. The client polls GET /api/practice/generations/{id}.
    //
    // The quota is consumed once, at enqueue time, and never again: a retry
    // here re-runs the model calls, it does not re-charge the student.
    [Index(nameof(StudentId))]
    [Index(nameof(Status))]
    public class PracticeGenerationJob : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner. Every read of this row is scoped to it, so one student can
        // never poll another student's job.
        public string StudentId { get; set; } = "";

        // queued | running | succeeded | failed. See PracticeGenerationStatus.
        public string Status { get; set; } = PracticeGenerationStatus.Queued;

        // ---- the generation request, as validated at enqueue time ---------
        // Resolved here rather than in the worker so the worker never has to
        // re-run authorisation: the assessment was already proved to belong to
        // this student, and the subject was already read off it.

        public long AssessmentId { get; set; }

        // CAPS subject slug (high school) or "institutionId:slug" course
        // practice key (tertiary). The colon is the discriminator.
        public string SubjectId { get; set; } = "";

        // multiple_choice | short_answer | reading | flashcards | essay | exam.
        public string Format { get; set; } = "multiple_choice";

        // foundation | core | challenge.
        public string Difficulty { get; set; } = "core";

        // Already clamped to the API's legal ranges at enqueue.
        public int QuestionCount { get; set; }
        public int TotalMarks { get; set; }

        // The topics to examine, jsonb string[]. Empty means "a representative
        // spread", which is what the generator does when nothing is named.
        public List<string> Topics { get; set; } = [];

        // ---- outcome ------------------------------------------------------

        // The PracticeTest this job produced. Null until it succeeds.
        public long? PracticeTestId { get; set; }

        // Why it failed, in language a student can read. Null unless failed.
        public string? Error { get; set; }

        // How many times a worker has picked this job up. Bounded by
        // PracticeGenerationWorker.MaxAttempts so a job that fails on every
        // attempt fails honestly instead of looping forever.
        public int Attempts { get; set; }

        // When the current worker claimed the job. A process that is killed
        // mid-generation leaves a row stuck in "running" with a claim that
        // stops advancing; the worker's stale-claim sweep reads this to put
        // the job back in the queue (or fail it, if it is out of attempts).
        public DateTime? ClaimedAt { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // The four states a job moves through. Strings rather than an enum so the
    // column reads plainly in psql and matches the JSON the client polls.
    public static class PracticeGenerationStatus
    {
        public const string Queued = "queued";
        public const string Running = "running";
        public const string Succeeded = "succeeded";
        public const string Failed = "failed";
    }
}
