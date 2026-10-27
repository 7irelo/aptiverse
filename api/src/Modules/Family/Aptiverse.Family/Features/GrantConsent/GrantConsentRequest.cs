namespace Aptiverse.Family.Features.GrantConsent;

/// <param name="DocumentVersion">The parental consent text version you read; it must be the current one.</param>
/// <param name="ConfirmIsParentOrGuardian">Must be true: you confirm you are this child's parent or legal guardian.</param>
internal sealed record GrantConsentRequest(string? DocumentVersion, bool ConfirmIsParentOrGuardian);
