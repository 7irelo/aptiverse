using System.Runtime.Serialization;

namespace Aptiverse.Core.Dtos
{
    [DataContract]
    public class TokenDto<T>
    {
        [DataMember(Name = "token")] public required string Token { get; set; }
        [DataMember(Name = "expires")] public DateTime Expires { get; set; }
        // Opaque, single-use, and long-lived (Jwt:RefreshExpireDays). Present on
        // the responses that start or continue a session — login, OAuth
        // exchange, POST /api/auth/refresh. Deliberately absent from the
        // [Authorize]d POST /api/auth/refresh-token, which only re-mints an
        // access token for a session that is already alive.
        [DataMember(Name = "refreshToken")] public string? RefreshToken { get; set; }
        [DataMember(Name = "refreshTokenExpires")] public DateTime? RefreshTokenExpires { get; set; }
        [DataMember(Name = "user")] public required T User { get; set; }
        [DataMember(Name = "message")] public string? Message { get; set; }
    }
}
