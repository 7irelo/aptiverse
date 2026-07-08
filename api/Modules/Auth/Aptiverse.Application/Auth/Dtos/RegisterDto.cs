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
        string? InstitutionId = null
    );
}
