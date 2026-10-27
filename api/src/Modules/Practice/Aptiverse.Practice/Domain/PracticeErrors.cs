using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Practice.Domain;

/// <summary>Stable error codes of the Practice module. The web runner switches on the code, never the text.</summary>
internal static class PracticeErrors
{
    // Same answer for "does not exist" and "belongs to someone else", so ids cannot be probed.
    public static readonly Error TestNotFound = Error.NotFound("practice.test_not_found", "The practice test was not found.");

    public static readonly Error AttemptNotFound = Error.NotFound("practice.attempt_not_found", "The attempt was not found.");

    public static readonly Error QuestionNotFound = Error.NotFound("practice.question_not_found", "The question was not found in this attempt.");

    public static readonly Error AssessmentNotFound = Error.NotFound(
        "practice.assessment_not_found",
        "The assessment was not found, or it is no longer upcoming.");

    public static readonly Error StudyUnitNotFound = Error.NotFound(
        "practice.study_unit_not_found",
        "You are not enrolled in the subject or course of this assessment.");

    public static readonly Error FormatNotAvailable = Error.Validation(
        "practice.format_not_available",
        "Reading comprehension is available for high school subjects only.",
        new Dictionary<string, string[]> { ["format"] = ["Reading comprehension is available for high school subjects only."] });

    public static readonly Error InvalidIdempotencyKey = Error.Validation(
        "practice.invalid_idempotency_key",
        "The Idempotency-Key header must be 8 to 64 letters, digits, dashes or underscores.",
        new Dictionary<string, string[]> { ["Idempotency-Key"] = ["Use 8 to 64 letters, digits, dashes or underscores."] });

    public static readonly Error GenerationInProgress = Error.Conflict(
        "practice.generation_in_progress",
        "A practice test is already being generated for you. Wait for it to finish before starting another.");

    public static readonly Error DailyLimitReached = Error.TooManyRequests(
        "practice.daily_limit_reached",
        "You have reached today's practice test limit. It resets at midnight UTC.");

    public static readonly Error QuotaExhausted = Error.TooManyRequests(
        "practice.quota_exhausted",
        "You have used this month's practice tests on your plan. Upgrade or wait for the allowance to reset.");

    public static readonly Error QuotaUnavailable = Error.Unavailable(
        "practice.quota_unavailable",
        "Your practice allowance could not be checked right now. Please try again in a moment.");

    public static readonly Error LimitUnavailable = Error.Unavailable(
        "practice.limit_unavailable",
        "Practice test generation is unavailable right now. Please try again in a moment.");

    public static readonly Error TestNotReady = Error.Conflict("practice.test_not_ready", "This practice test is not ready to start.");

    public static readonly Error TestArchived = Error.Conflict("practice.test_archived", "An archived practice test cannot be started.");

    public static readonly Error AttemptExists = Error.Conflict(
        "practice.attempt_exists",
        "You have already attempted this practice test. Each test can be attempted once.");

    public static readonly Error OtherAttemptActive = Error.Conflict(
        "practice.other_attempt_active",
        "You have another practice test in progress. Finish it before starting this one.");

    public static readonly Error AttemptActive = Error.Conflict(
        "practice.attempt_active",
        "This practice test is in progress. Submit it before removing it.");

    public static readonly Error AttemptNotActive = Error.Conflict("practice.attempt_not_active", "This attempt has already been submitted.");

    public static readonly Error AttemptPaused = Error.Conflict("practice.attempt_paused", "Resume the attempt before saving answers.");

    public static readonly Error PauseNotAllowed = Error.Conflict(
        "practice.pause_not_allowed",
        "Timed tests run under exam conditions and cannot be paused.");

    public static readonly Error DeadlinePassed = Error.Conflict(
        "practice.deadline_passed",
        "Time is up for this attempt. It is submitted automatically with the answers saved before the deadline.");

    public static readonly Error RevisionConflict = Error.Conflict(
        "practice.revision_conflict",
        "This answer changed somewhere else since you loaded it. Reload the attempt and try again.");

    public static readonly Error AnswerKindMismatch = Error.Validation(
        "practice.answer_kind_mismatch",
        "This answer does not fit the question.",
        new Dictionary<string, string[]>
        {
            ["answer"] = ["Send selectedIndex for multiple choice, selfRating for flashcards and textAnswer for written questions."],
        });

    public static readonly Error ResultsNotReady = Error.Conflict(
        "practice.results_not_ready",
        "Results are available once the attempt is submitted.");

    public static readonly Error ConcurrencyConflict = Error.Conflict(
        "practice.concurrency_conflict",
        "This attempt changed while your request was being handled. Reload it and try again.");
}
