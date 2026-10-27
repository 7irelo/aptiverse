namespace Aptiverse.Practice.Features.GetResults;

/// <summary>A marked paper. Answer keys are only ever sent here, after submission.</summary>
/// <param name="AttemptId">The attempt.</param>
/// <param name="TestId">The test.</param>
/// <param name="Title">The test's title.</param>
/// <param name="Format">The test format.</param>
/// <param name="Status">"submitted", "grading" or "graded".</param>
/// <param name="ScoreMarks">Marks awarded; null while any answer is not marked yet (never zero for unmarked work).</param>
/// <param name="MaxMarks">Marks available on the whole paper (0 for flashcards).</param>
/// <param name="ScorePercent">Null likewise.</param>
/// <param name="MarkedMarks">Marks available on the part that is marked.</param>
/// <param name="MarkedScore">Marks awarded on the part that is marked.</param>
/// <param name="PartiallyGraded">Some answers could not be marked.</param>
/// <param name="SubmittedAt">When it was submitted.</param>
/// <param name="SubmitSource">"student" or "deadline".</param>
/// <param name="SecondsOnTask">Elapsed time without pauses, capped at the duration for timed tests.</param>
/// <param name="FocusLossCount">Times the test lost focus.</param>
/// <param name="Topics">Accuracy per topic once graded.</param>
/// <param name="Questions">Every question with your answer and the answer key.</param>
internal sealed record AttemptResults(
    Guid AttemptId,
    Guid TestId,
    string Title,
    string Format,
    string Status,
    int? ScoreMarks,
    int MaxMarks,
    decimal? ScorePercent,
    int? MarkedMarks,
    int? MarkedScore,
    bool PartiallyGraded,
    DateTimeOffset? SubmittedAt,
    string? SubmitSource,
    int SecondsOnTask,
    int FocusLossCount,
    IReadOnlyList<TopicResult> Topics,
    IReadOnlyList<ResultQuestion> Questions);

internal sealed record TopicResult(string Topic, int QuestionsTotal, int QuestionsCorrect, int MarksAvailable, int MarksAwarded);

/// <param name="Id">The question.</param>
/// <param name="Position">1-based order.</param>
/// <param name="Kind">The question type.</param>
/// <param name="Section">Paper section label.</param>
/// <param name="Topic">The topic.</param>
/// <param name="Stem">The question.</param>
/// <param name="Options">Multiple choice options.</param>
/// <param name="Marks">Marks available.</param>
/// <param name="YourSelectedIndex">Your option, for multiple choice.</param>
/// <param name="YourAnswer">Your written answer.</param>
/// <param name="YourSelfRating">Your self rating, for flashcards.</param>
/// <param name="CorrectIndex">The correct option, for multiple choice.</param>
/// <param name="CorrectAnswer">The expected answer (the back of a flashcard).</param>
/// <param name="Memo">The marking memo.</param>
/// <param name="Explanation">The worked explanation.</param>
/// <param name="IsCorrect">Null until marked.</param>
/// <param name="AwardedMarks">Part marks allowed; null while not marked yet.</param>
/// <param name="Feedback">Examiner-style feedback.</param>
/// <param name="NeedsReview">The marker was not confident about this mark.</param>
/// <param name="MarkingStatus">"marked", "not_marked_yet" or "self_rated".</param>
internal sealed record ResultQuestion(
    Guid Id,
    int Position,
    string Kind,
    string? Section,
    string Topic,
    string Stem,
    IReadOnlyList<string> Options,
    int Marks,
    int? YourSelectedIndex,
    string? YourAnswer,
    string? YourSelfRating,
    int? CorrectIndex,
    string? CorrectAnswer,
    string Memo,
    string Explanation,
    bool? IsCorrect,
    int? AwardedMarks,
    string? Feedback,
    bool NeedsReview,
    string MarkingStatus);
