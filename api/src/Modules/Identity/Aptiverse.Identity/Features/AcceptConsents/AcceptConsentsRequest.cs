namespace Aptiverse.Identity.Features.AcceptConsents;

/// <param name="TermsVersion">Must equal termsVersion from getLegalVersions.</param>
/// <param name="PrivacyVersion">Must equal privacyVersion from getLegalVersions.</param>
/// <param name="MarketingEmails">True opts in to product news, false withdraws; omit to leave it unchanged.</param>
internal sealed record AcceptConsentsRequest(string TermsVersion, string PrivacyVersion, bool? MarketingEmails = null);
