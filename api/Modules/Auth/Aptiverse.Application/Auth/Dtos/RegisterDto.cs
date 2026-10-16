namespace Aptiverse.Application.Auth.Dtos
{
    public record RegisterDto(
        string Email,
        string Password,
        string FirstName,
        string LastName,
        string Role,
        // Academic profile captured at signup. EducationLevel is the switch:
        // "highschool" uses CurriculumId + Grade; "tertiary" uses InstitutionId.
        string? EducationLevel = null,
        string? CurriculumId = null,
        int? Grade = null,
        string? InstitutionId = null,
        // The user ticked the "I agree to the Terms and the Privacy Policy"
        // box on the signup form. Self sign-up is rejected without it: the
        // checkbox on its own proves nothing, since anyone can POST here
        // directly, so the endpoint is the real gate.
        //
        // Deliberately NOT a version string from the client. The version that
        // gets recorded is the one the server has published (Legal:TermsVersion
        // / Legal:PrivacyVersion), so a caller cannot claim to have accepted
        // some other text.
        bool AcceptedTerms = false
    );
}
