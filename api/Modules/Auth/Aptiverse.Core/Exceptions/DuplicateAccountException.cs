namespace Aptiverse.Core.Exceptions
{
    /// <summary>
    /// Sign-up was refused because an account already exists for that email.
    ///
    /// Kept distinct from the generic UserRegistrationException so the API can
    /// answer with a clean "you already have an account, sign in instead"
    /// rather than leaking Identity's raw "Username '...' is already taken.,
    /// Email '...' is already taken." string, which reads as a system error and
    /// exposes the internal username==email detail.
    /// </summary>
    public class DuplicateAccountException : Exception
    {
        public string Email { get; }

        public DuplicateAccountException(string email)
            : base("An account with that email already exists. Please sign in instead.")
        {
            Email = email;
        }
    }
}
