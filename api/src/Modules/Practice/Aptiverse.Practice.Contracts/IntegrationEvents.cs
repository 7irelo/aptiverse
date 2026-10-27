namespace Aptiverse.Practice.Contracts;

// Integration events published by Practice through the transactional outbox. They carry ids, scores and topic
// names, never the student's answers.

public sealed record PracticeTestGenerated(Guid TestId, Guid UserId, Guid StudyUnitId, int QuestionCount, DateTimeOffset OccurredAt);

public sealed record PracticeTestGenerationFailed(Guid TestId, Guid UserId, string ErrorCode, DateTimeOffset OccurredAt);

/// <param name="AttemptId">The attempt.</param>
/// <param name="TestId">The test attempted.</param>
/// <param name="UserId">The student.</param>
/// <param name="Mode">"timed" or "untimed".</param>
/// <param name="DeadlineAt">Server deadline of a timed attempt, otherwise null.</param>
/// <param name="OccurredAt">When the attempt started.</param>
public sealed record PracticeAttemptStarted(Guid AttemptId, Guid TestId, Guid UserId, string Mode, DateTimeOffset? DeadlineAt, DateTimeOffset OccurredAt);

/// <param name="AttemptId">The attempt.</param>
/// <param name="UserId">The student.</param>
/// <param name="SubmitSource">"student" or "deadline" (auto-submitted).</param>
/// <param name="FocusLossCount">Times the test lost focus; informational, never punitive.</param>
/// <param name="OccurredAt">When it was submitted.</param>
public sealed record PracticeAttemptSubmitted(Guid AttemptId, Guid UserId, string SubmitSource, int FocusLossCount, DateTimeOffset OccurredAt);

/// <summary>
/// The final grade of a scored attempt, published once. When <paramref name="PartiallyGraded"/> is true some written
/// answers could not be marked: the scores cover the marked part only and pending answers are never counted as zero.
/// <paramref name="QuestionsMarked"/> and <see cref="TopicAccuracy.QuestionsMarked"/> count the marked questions, so a
/// subscriber can use the marked part of a partly graded attempt. Flashcard attempts are self-rated and publish no grade.
/// </summary>
/// <param name="AttemptId">The attempt.</param>
/// <param name="TestId">The test.</param>
/// <param name="UserId">The student.</param>
/// <param name="StudyUnitId">The study unit the test belongs to.</param>
/// <param name="ScoreMarks">Marks awarded on the marked part.</param>
/// <param name="MaxMarks">Marks available on the marked part.</param>
/// <param name="ScorePercent">Percent of the marked part, two decimals.</param>
/// <param name="PartiallyGraded">Some answers are not marked yet.</param>
/// <param name="SecondsOnTask">Elapsed time without pauses, capped at the duration for timed tests.</param>
/// <param name="Topics">Accuracy per topic.</param>
/// <param name="QuestionsMarked">Questions with a mark (correct or not); equals the question count unless partly graded.</param>
/// <param name="SubmittedAt">When the attempt was submitted.</param>
/// <param name="OccurredAt">When the grade was recorded.</param>
public sealed record PracticeAttemptGraded(
    Guid AttemptId,
    Guid TestId,
    Guid UserId,
    Guid StudyUnitId,
    int ScoreMarks,
    int MaxMarks,
    decimal ScorePercent,
    bool PartiallyGraded,
    int SecondsOnTask,
    IReadOnlyList<TopicAccuracy> Topics,
    DateTimeOffset SubmittedAt,
    DateTimeOffset OccurredAt,
    int QuestionsMarked = 0);

/// <param name="Topic">The topic as the questions name it.</param>
/// <param name="QuestionsTotal">Questions on the topic, marked or not.</param>
/// <param name="QuestionsCorrect">Marked questions answered fully correctly.</param>
/// <param name="MarksAvailable">Marks available on the marked questions.</param>
/// <param name="MarksAwarded">Marks awarded on the marked questions.</param>
/// <param name="QuestionsMarked">Questions on the topic with a mark. Zero in events published before this field existed.</param>
public sealed record TopicAccuracy(string Topic, int QuestionsTotal, int QuestionsCorrect, int MarksAvailable, int MarksAwarded, int QuestionsMarked = 0);
