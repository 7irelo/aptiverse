namespace Aptiverse.Family.Features.RedeemLinkCode;

/// <param name="Code">The code your child gave you; dashes, spaces and case do not matter.</param>
/// <param name="Relationship">"mother", "father", "guardian" or "other".</param>
internal sealed record RedeemLinkCodeRequest(string? Code, string? Relationship);
