namespace Aptiverse.AiTutor.Contracts;

/// <summary>
/// How much a student used the tutor, for other modules (Family's parent views). Counts only: no titles, questions,
/// answers or times ever leave the AiTutor module through this interface.
/// </summary>
public interface ITutorActivityLookup
{
    Task<TutorActivity> GetAsync(Guid userId, DateTimeOffset since, CancellationToken cancellationToken);
}

/// <param name="Conversations">Conversations with at least one question since the given time.</param>
/// <param name="QuestionsAsked">Questions the student sent since the given time.</param>
public sealed record TutorActivity(int Conversations, int QuestionsAsked);
