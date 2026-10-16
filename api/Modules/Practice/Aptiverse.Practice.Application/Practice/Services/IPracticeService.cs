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

        // Questions for a test. The answer key (AnswerIdx, ExpectedAnswer,
        // AcceptableAnswers, Explanation) is attached only when this student has
        // already submitted an attempt, because the same call renders the test
        // while they are taking it. Flashcards are exempt: the back of the card
        // is the content.
        Task<IReadOnlyList<FrontendQuestionDto>?> GetQuestionsAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default);

        // Delete a test the student generated for themselves, plus their
        // attempts at it.
        //
        // There was no way to do this at all: generated tests accumulated on the
        // practice page forever, and a student drilling one topic a week ends up
        // scrolling past months of dead cards to find the one they want.
        //
        // Deletes only where OwnerStudentId matches the caller. A shared test
        // (OwnerStudentId == null: seeded or teacher-authored) is visible to
        // everyone, so letting one student delete it would take it from all of
        // them. Those return DeleteTestResult.Forbidden, not NotFound, because
        // the test does exist and the student can see it.
        Task<DeleteTestResult> DeleteTestAsync(
            long testId,
            string studentId,
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

    // Outcome of DeleteTestAsync. An enum rather than a bool so the controller
    // can tell "no such test" from "not yours to delete" and return 404 vs 403
    // honestly, instead of collapsing both into a 404 that lies about one of
    // them.
    public enum DeleteTestResult
    {
        Deleted,
        NotFound,
        // A shared test: real, visible to this student, not theirs to remove.
        Forbidden,
    }
}
