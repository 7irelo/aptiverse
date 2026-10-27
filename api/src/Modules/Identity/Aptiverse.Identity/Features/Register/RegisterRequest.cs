namespace Aptiverse.Identity.Features.Register;

/// <param name="Name">Display name, 2 to 120 characters including letters.</param>
/// <param name="Email">Max 256 characters; the domain is stored lowercased.</param>
/// <param name="Password">10 to 128 characters, no composition rules, not the email address.</param>
/// <param name="Role">"student" or "parent". Admin is never self-registerable.</param>
/// <param name="AcceptedTermsVersion">Must equal termsVersion from getLegalVersions.</param>
/// <param name="AcceptedPrivacyVersion">Must equal privacyVersion from getLegalVersions.</param>
/// <param name="MarketingEmails">Opt in to product news by email; defaults to false.</param>
internal sealed record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string Role,
    string AcceptedTermsVersion,
    string AcceptedPrivacyVersion,
    bool MarketingEmails = false);
