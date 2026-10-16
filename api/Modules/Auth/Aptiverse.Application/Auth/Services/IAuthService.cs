using Aptiverse.Application.Auth.Dtos;
using Aptiverse.Application.Users.Dtos;
using Aptiverse.Core.Dtos;
using System.Security.Claims;

namespace Aptiverse.Application.Auth.Services
{
    // The account whose address was just confirmed.
    public sealed record ConfirmEmailResult(string UserId, string Email, string FirstName);

    public interface IAuthService
    {
        Task<UserDto> GetCurrentUserAsync(ClaimsPrincipal loggedInUser);
        Task RegisterUserAsync(RegisterDto registerDto);
        Task<TokenDto<UserDto>> LoginUserAsync(LoginDto dto);
        Task<TokenDto<UserDto>> RefreshTokenAsync(ClaimsPrincipal loggedInUser);
        Task<TokenDto<UserDto>> RefreshAccessTokenAsync(string refreshToken);
        Task<TokenValidDto> ValidateTokenAsync(ValidateTokenDto validateTokenDto);
        Task<object> ChangePasswordAsync(ClaimsPrincipal loggedInUser, ChangePasswordDto changePasswordDto);
        Task<object> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<object> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task<object> LogoutUserAsync(ClaimsPrincipal loggedInUser, string? refreshToken = null);
        // Returns who was confirmed so the caller can act on it (the referral
        // welcome email). Throws when the token is bad or expired: Identity
        // reports that in a result rather than by throwing, and the previous
        // signature discarded it, so a bad token returned success.
        Task<ConfirmEmailResult> ConfirmEmail(string userId, string token);
        Task ResendVerificationAsync(string email);
    }
}
