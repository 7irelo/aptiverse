using System.Runtime.Serialization;

namespace Aptiverse.Application.Auth.Dtos
{
    /// <summary>
    /// Request body for POST /api/auth/oauth-exchange.
    /// Sent by NextAuth (web) or the mobile app after a successful OAuth
    /// flow with Google or Apple. Contains the provider's signed ID token,
    /// which the backend validates before issuing its own JWT.
    /// </summary>
    [DataContract]
    public class OAuthExchangeDto
    {
        [DataMember(Name = "provider")] public string Provider { get; set; } = string.Empty;
        [DataMember(Name = "idToken")] public string IdToken { get; set; } = string.Empty;
    }
}
