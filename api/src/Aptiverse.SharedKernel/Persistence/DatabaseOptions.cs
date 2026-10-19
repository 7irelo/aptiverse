using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Aptiverse.SharedKernel.Persistence;

/// <summary>
/// Bound from ConnectionStrings. Supply via env (ConnectionStrings__Aptiverse), or as separate Database__Host, __Port,
/// __Name, __Username and __Password values, which is what ECS can inject from the RDS managed master secret.
/// </summary>
public sealed class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";
    public const string PartsSectionName = "Database";

    [Required(AllowEmptyStrings = false)]
    public string Aptiverse { get; set; } = string.Empty;

    public string ConnectionString => Normalize(Aptiverse);

    /// <summary>Builds a connection string from the Database section, or returns null when Host is not set.</summary>
    public static string? FromParts(IConfiguration parts)
    {
        ArgumentNullException.ThrowIfNull(parts);
        if (string.IsNullOrWhiteSpace(parts["Host"]))
        {
            return null;
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = parts["Host"],
            Port = int.TryParse(parts["Port"], NumberStyles.None, CultureInfo.InvariantCulture, out var port) ? port : 5432,
            Database = parts["Name"],
            Username = parts["Username"],
            Password = parts["Password"],
            // RDS enforces TLS (rds.force_ssl); never fall back to plaintext.
            SslMode = Enum.TryParse<SslMode>(parts["SslMode"], ignoreCase: true, out var sslMode) ? sslMode : SslMode.Require,
        };

        return builder.ConnectionString;
    }

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
