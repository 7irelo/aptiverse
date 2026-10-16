using System.ComponentModel.DataAnnotations;
using Npgsql;

namespace Aptiverse.SharedKernel.Persistence;

/// <summary>Bound from ConnectionStrings. Supply via env (ConnectionStrings__Aptiverse) or a secret store.</summary>
public sealed class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";

    [Required(AllowEmptyStrings = false)]
    public string Aptiverse { get; set; } = string.Empty;

    public string ConnectionString => Normalize(Aptiverse);

    /// <summary>
    /// Disables GSSAPI encryption unless the connection string asks for it. The chiselled runtime image has no
    /// Kerberos libraries, and probing for them logs a misleading error on every new connection.
    /// </summary>
    public static string Normalize(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        if (!connectionString.Contains("GSS", StringComparison.OrdinalIgnoreCase))
        {
            builder.GssEncryptionMode = GssEncryptionMode.Disable;
        }

        return builder.ConnectionString;
    }
}
