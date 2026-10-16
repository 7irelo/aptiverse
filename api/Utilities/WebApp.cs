namespace Aptiverse.Api.Utilities
{
    // Single source of truth for the public web app origin used in outbound
    // links (invite emails, reminders, billing and verification links). Reads
    // App:WebBaseUrl (env App__WebBaseUrl) once at startup and falls back to the
    // production domain when unset, so links resolve to the right host per
    // environment: localhost:3000 in dev, https://aptiverse.co.za in prod.
    public static class WebApp
    {
        // Used when App:WebBaseUrl is not configured. Matches the production
        // domain the outbound links historically hardcoded.
        private const string DefaultBaseUrl = "https://aptiverse.co.za";

        // Origin with no trailing slash, so callers can safely concatenate a
        // leading-slash path. Set once from configuration at startup.
        public static string BaseUrl { get; private set; } = DefaultBaseUrl;

        // Wire the base URL from configuration. Call once during startup.
        public static void Configure(IConfiguration config)
        {
            var configured = config["App:WebBaseUrl"];
            if (!string.IsNullOrWhiteSpace(configured))
                BaseUrl = configured.Trim().TrimEnd('/');
        }

        // Absolute URL for an app path. Pass a leading-slash path, e.g.
        // "/dashboard/connections" or "/login?callbackUrl=...".
        public static string Url(string path)
            => path.StartsWith('/') ? $"{BaseUrl}{path}" : $"{BaseUrl}/{path}";
    }
}
