using Aptiverse.Application.Auth.Dtos;
using Aptiverse.Application.Users.Dtos;
using Aptiverse.Core.Dtos;

namespace Aptiverse.Application.Auth.Services
{
    public interface IOAuthExchangeService
    {
        /// <summary>
        /// Validate an external provider's ID token, find or create the
        /// corresponding User, and return an Aptiverse JWT.
        /// </summary>
        Task<TokenDto<UserDto>> ExchangeAsync(OAuthExchangeDto request);
    }
}
