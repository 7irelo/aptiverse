namespace Aptiverse.Academics.Features.RecordAssessmentMark;

/// <summary>
/// A whole-number mark, in exactly one form: MarkObtained out of MarkTotal, or Percent alone (stored as that
/// many out of 100). The percentage is computed by the server.
/// </summary>
/// <param name="MarkObtained">0 to 10000, at most MarkTotal.</param>
/// <param name="MarkTotal">1 to 10000.</param>
/// <param name="Percent">0 to 100, instead of MarkObtained and MarkTotal.</param>
internal sealed record RecordAssessmentMarkRequest(int? MarkObtained, int? MarkTotal, int? Percent);
