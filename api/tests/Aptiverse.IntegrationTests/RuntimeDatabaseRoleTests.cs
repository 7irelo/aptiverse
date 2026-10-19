using Aptiverse.SharedKernel.Persistence;
using Npgsql;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class RuntimeDatabaseRoleTests(ApiFactory factory)
{
    [Fact]
    public async Task Runtime_role_can_change_rows_but_not_the_schema()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var ct = TestContext.Current.CancellationToken;
        var role = new RuntimeDatabaseRole { Username = "aptiverse_app_test", Password = Guid.NewGuid().ToString("N") };

        var schemas = await role.EnsureAsync(factory.ConnectionString, ct);
        await role.EnsureAsync(factory.ConnectionString, ct);

        Assert.Contains("identity", schemas);
        Assert.Contains("support", schemas);
        Assert.Contains("wolverine", schemas);

        var asRuntime = new NpgsqlConnectionStringBuilder(factory.ConnectionString) { Username = role.Username, Password = role.Password }.ConnectionString;
        await using var connection = new NpgsqlConnection(asRuntime);
        await connection.OpenAsync(ct);

        await using (var select = new NpgsqlCommand("SELECT count(*) FROM support.faqs", connection))
        {
            await select.ExecuteScalarAsync(ct);
        }

        await using (var delete = new NpgsqlCommand("DELETE FROM identity.security_events WHERE false", connection))
        {
            await delete.ExecuteNonQueryAsync(ct);
        }

        await using var ddl = new NpgsqlCommand("CREATE TABLE support.not_allowed (id int)", connection);
        var denied = await Assert.ThrowsAsync<PostgresException>(() => ddl.ExecuteNonQueryAsync(ct));
        Assert.Equal(PostgresErrorCodes.InsufficientPrivilege, denied.SqlState);
    }

    [Fact]
    public async Task Runtime_role_must_differ_from_the_owner()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var owner = new NpgsqlConnectionStringBuilder(factory.ConnectionString).Username;
        var role = new RuntimeDatabaseRole { Username = owner, Password = "irrelevant" };

        await Assert.ThrowsAsync<InvalidOperationException>(() => role.EnsureAsync(factory.ConnectionString, TestContext.Current.CancellationToken));
    }
}
