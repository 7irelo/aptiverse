namespace Aptiverse.Academics.Features.ListMyUnits;

/// <param name="Status">"active" (default), "completed" or "all".</param>
internal sealed record ListMyUnitsRequest(string? Status);
