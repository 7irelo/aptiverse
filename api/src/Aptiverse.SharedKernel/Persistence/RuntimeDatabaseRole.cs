using System.Text.RegularExpressions;
using Npgsql;

namespace Aptiverse.SharedKernel.Persistence;

/// <summary>
/// The login the api and worker use at runtime. It may read and write rows in every schema the migrator owns
/// and nothing else: no DDL, no ownership, no other databases. The migrate command creates or updates it after
/// the schemas exist, so the deployed app never holds the RDS master credentials.
/// </summary>
public sealed partial class RuntimeDatabaseRole
{
    public const string SectionName = "Database:Runtime";

    public string? Username { get; set; }

    public string? Password { get; set; }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Username) && !string.IsNullOrWhiteSpace(Password);

    /// <summary>
    /// Creates the role or resets its password, then grants DML on every schema owned by the connected user,
    /// including default privileges for tables later migrations add. Idempotent; safe on every deploy.
    /// Returns the schemas granted.
    /// </summary>
    public async Task<IReadOnlyList<string>> EnsureAsync(string connectionString, CancellationToken cancellationToken)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Database:Runtime:Username and Password are both required.");
        }

        var username = Username!;
        if (!RoleName().IsMatch(username))
        {
            throw new InvalidOperationException("Database:Runtime:Username must be a lower case Postgres identifier.");
        }

        await using var dataSource = NpgsqlDataSource.Create(connectionString);
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        var owner = await ScalarAsync<string>(connection, "SELECT current_user", cancellationToken);
        if (string.Equals(owner, username, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("The runtime role must differ from the migrating user, or it would own the schemas.");
        }

        var exists = await ScalarAsync<bool>(
            connection, "SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = @role)", cancellationToken, ("role", username));

        // Identifiers and the password are quoted by the server (format %I and %L), never concatenated here.
        await ExecuteFormattedAsync(
            connection,
            exists
                ? "SELECT format('ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L', @role, @password)"
                : "SELECT format('CREATE ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L', @role, @password)",
            cancellationToken,
            ("role", username),
            ("password", Password!));

        await ExecuteFormattedAsync(
            connection, "SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), @role)", cancellationToken, ("role", username));

        var schemas = new List<string>();
        await using (var command = new NpgsqlCommand(
            """
            SELECT n.nspname
            FROM pg_namespace n
            WHERE n.nspowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
              AND n.nspname NOT LIKE 'pg\_%'
              AND n.nspname NOT IN ('information_schema', 'public')
            ORDER BY n.nspname
            """,
            connection))
        await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
            {
                schemas.Add(reader.GetString(0));
            }
        }

        string[] grants =
        [
            "GRANT USAGE ON SCHEMA %1$I TO %2$I",
            "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %1$I TO %2$I",
            "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA %1$I TO %2$I",
            "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %1$I TO %2$I",
            "ALTER DEFAULT PRIVILEGES IN SCHEMA %1$I GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %2$I",
            "ALTER DEFAULT PRIVILEGES IN SCHEMA %1$I GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO %2$I",
            "ALTER DEFAULT PRIVILEGES IN SCHEMA %1$I GRANT EXECUTE ON FUNCTIONS TO %2$I",
        ];

        foreach (var schema in schemas)
        {
            foreach (var grant in grants)
            {
                await ExecuteFormattedAsync(
                    connection, "SELECT format(@template, @schema, @role)", cancellationToken,
                    ("template", grant), ("schema", schema), ("role", username));
            }
        }

        return schemas;
    }

    private static async Task<T> ScalarAsync<T>(
        NpgsqlConnection connection, string sql, CancellationToken cancellationToken, params (string Name, object Value)[] parameters)
    {
        await using var command = new NpgsqlCommand(sql, connection);
        foreach (var (name, value) in parameters)
        {
            command.Parameters.AddWithValue(name, value);
        }

        return (T)(await command.ExecuteScalarAsync(cancellationToken))!;
    }

    private static async Task ExecuteFormattedAsync(
        NpgsqlConnection connection, string formatSql, CancellationToken cancellationToken, params (string Name, object Value)[] parameters)
    {
        var statement = await ScalarAsync<string>(connection, formatSql, cancellationToken, parameters);
        await using var command = new NpgsqlCommand(statement, connection);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    [GeneratedRegex("^[a-z_][a-z0-9_]{0,62}$")]
    private static partial Regex RoleName();
}
