using Aptiverse.Practice.Application.Frontend.Dtos;

namespace Aptiverse.Practice.Application.Practice.Services
{
    // Application service backing the PracticeController. Persists attempts,
    // scores them, and tags per-topic correctness (the mastery feed).
    public interface IPracticeService
    {
        // List tests, optionally filtered by subject + difficulty. bestScore /
        // attempts are computed per student from their own attempt history.
        Task<IReadOnlyList<FrontendPracticeTestDto>> GetTestsAsync(
            string studentId,
            string? subjectId = null,
            string? difficulty = null,
            CancellationToken cancellationToken = default);

        Task<FrontendPracticeTestDto?> GetTestAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<FrontendQuestionDto>?> GetQuestionsAsync(
            long testId,
            CancellationToken cancellationToken = default);

        // Start a new in-progress attempt. Returns null when the test is unknown.
        Task<FrontendAttemptDto?> StartAttemptAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default);

        // Submit/patch an attempt: grades each answer against the test key,
        // writes AnswerSubmission + PracticeAttemptItem rows, builds the
        // AttemptScoreSummary (totals + per-topic), and flips the attempt to
        // Submitted. Returns null when the attempt is unknown or not owned by
        // the student.
        Task<FrontendAttemptDto?> SubmitAttemptAsync(
            long attemptId,
            string studentId,
            FrontendAttemptDto submission,
            CancellationToken cancellationToken = default);

        // The student's most recent submitted attempt at a test, with its
        // items + score summary, for reviewing a completed test without
        // retaking it. Null when they have no submitted attempt yet.
        Task<FrontendAttemptDto?> GetLatestAttemptAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default);
    }
}
