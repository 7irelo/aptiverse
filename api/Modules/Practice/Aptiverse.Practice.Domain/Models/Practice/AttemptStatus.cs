namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Lifecycle of a PracticeAttempt. Persisted as text by the
    // ApplicationDbContext cross-cutting convention (enums -> HasConversion<string>),
    // so the column reads "InProgress" / "Submitted" rather than an opaque int.
    public enum AttemptStatus
    {
        // Created when the student starts the test; no answers scored yet.
        InProgress = 0,

        // Student submitted; items have been scored and the summary written.
        Submitted = 1,

        // Started but explicitly abandoned without a submit (kept for ML
        // signal — a high abandon rate on a topic is itself informative).
        Abandoned = 2,
    }
}
