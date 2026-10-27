namespace Aptiverse.Practice.Features.SaveAnswer;

/// <summary>Exactly one of selectedIndex (multiple choice), textAnswer (written) or selfRating (flashcards).</summary>
/// <param name="SelectedIndex">0-based option index of a multiple choice question.</param>
/// <param name="TextAnswer">A written answer, at most 5000 characters.</param>
/// <param name="SelfRating">Flashcards: "knew", "unsure" or "did_not_know".</param>
/// <param name="BaseRevision">The revision you last saw for this answer (0 for a first save).</param>
internal sealed record SaveAttemptAnswerRequest(int? SelectedIndex, string? TextAnswer, string? SelfRating, int BaseRevision);

/// <param name="QuestionId">The question.</param>
/// <param name="Revision">The stored revision; send it as baseRevision with the next save.</param>
/// <param name="SavedAt">Server time of the save.</param>
internal sealed record SavedAnswer(Guid QuestionId, int Revision, DateTimeOffset SavedAt);
