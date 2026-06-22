namespace Aptiverse.Application.Auth.Dtos
{
    public record RegisterDto(
        string Email,
        string Password,
        string FirstName,
        string LastName,
        string Role
    );
}
