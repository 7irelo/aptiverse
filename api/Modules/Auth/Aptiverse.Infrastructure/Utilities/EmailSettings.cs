namespace Aptiverse.Infrastructure.Utilities
{
    public class EmailSettings
    {
        public string? Server { get; set; }
        public int Port { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;

        // Where human replies should go. SenderEmail is a no-reply address that
        // nobody reads, so outbound mail sets Reply-To to a monitored inbox
        // (the Zoho support@ alias). Overridable via EmailSettings:ReplyToEmail.
        public string ReplyToEmail { get; set; } = "support@aptiverse.co.za";
    }
}
