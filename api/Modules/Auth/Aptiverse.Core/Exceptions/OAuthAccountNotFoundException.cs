namespace Aptiverse.Core.Exceptions
{
    /// <summary>
    /// Thrown when a social sign-in (Google) presents a valid token for an
    /// email that has no existing Aptiverse account. Google sign-in is
    /// invite-only: it authenticates existing users, it never provisions new
    /// ones. The controller maps this to 404 so the web client can show a
    /// specific "no account for this email" message.
    /// </summary>
    public class OAuthAccountNotFoundException : Exception
    {
        public OAuthAccountNotFoundException(string message) : base(message) { }
    }
}
