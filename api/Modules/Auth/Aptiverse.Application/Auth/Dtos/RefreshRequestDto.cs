namespace Aptiverse.Application.Auth.Dtos
{
    /// <summary>
    /// Body of POST /api/auth/refresh. The token travels in the body and never
    /// in the path or query string: query strings end up in access logs, browser
    /// history and Referer headers, and this value is a credential.
    /// </summary>
    public class RefreshRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
