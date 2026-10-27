namespace Aptiverse.Academics.Features.UnenrolFromUnit;

/// <param name="Confirm">Required (true) when the unit has marked assessments, which are deleted with it.</param>
internal sealed record UnenrolFromUnitRequest(bool Confirm = false);
