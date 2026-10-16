namespace Aptiverse.Core.Services
{
    /// <summary>
    /// Wire format for refresh tokens: "{userId}.{secret}".
    ///
    /// The secret half is the 32 cryptographic random bytes from
    /// <see cref="ITokenProvider.GenerateRefreshToken"/>. The user id half is
    /// not a secret and adds no entropy — it is there because the token store
    /// is keyed by user, and the anonymous refresh endpoint has no
    /// authenticated principal to read a user id off. Without it the caller
    /// would have to send its own user id alongside the token, which is one
    /// more thing a client can get wrong.
    ///
    /// Only ever the composite string is handed to <see cref="ITokenStorageService"/>,
    /// which hashes before it writes, so nothing lands in Redis in the clear.
    /// Identity user ids are GUID strings and never contain '.', so the first
    /// separator is unambiguous.
    /// </summary>
    public static class RefreshTokens
    {
        private const char Separator = '.';

        public static string Compose(string userId, string secret) =>
            $"{userId}{Separator}{secret}";

        /// <summary>
        /// Pulls the user id out of a presented refresh token. Returns false for
        /// anything that isn't the expected shape — callers must treat that as a
        /// rejection, never as a reason to look the token up some other way.
        /// </summary>
        public static bool TryParseUserId(string? token, out string userId)
        {
            userId = string.Empty;
            if (string.IsNullOrWhiteSpace(token)) return false;

            var idx = token.IndexOf(Separator);
            if (idx <= 0 || idx == token.Length - 1) return false;

            userId = token[..idx];
            return true;
        }
    }
}
