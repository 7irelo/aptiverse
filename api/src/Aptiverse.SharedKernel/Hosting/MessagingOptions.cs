namespace Aptiverse.SharedKernel.Hosting;

public sealed class MessagingOptions
{
    public const string SectionName = "Messaging";

    /// <summary>Postgres schema for Wolverine envelope, outbox and scheduling tables.</summary>
    public string Schema { get; set; } = "wolverine";

    /// <summary>
    /// Create or update the Wolverine tables on boot. False in deployed environments, where
    /// `resources setup` runs as part of the migration task. EF migrations are never applied on boot.
    /// </summary>
    public bool AutoBuildStorage { get; set; }

    /// <summary>Single-node mode (no leader election). Useful for tests and one-box local runs.</summary>
    public bool SoloMode { get; set; }
}
