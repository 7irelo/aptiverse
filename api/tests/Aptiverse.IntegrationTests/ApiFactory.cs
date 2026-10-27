using System.Security.Cryptography;
using Aptiverse.AiTutor.AiService;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Seeding;
using JasperFx.CommandLine;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Testcontainers.PostgreSql;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// Boots the real API against a throwaway Postgres 17 container. Migrations and seed data are applied here,
/// the same way scripts/migrate.sh and the seed command do it, because the host never migrates on boot.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private PostgreSqlContainer? _postgres;
    private IHost? _host;

    public bool DockerAvailable { get; private set; }

    /// <summary>The fake ai service every AiTutor call goes to.</summary>
    public StubAiService AiStub { get; } = new();

    /// <summary>Daily tutor message limit in tests, low so the limit is cheap to reach.</summary>
    public const int DailyMessageLimit = 3;

    /// <summary>The running host, for Wolverine message tracking in tests.</summary>
    public IHost AppHost => _host ?? throw new InvalidOperationException("The host has not been created yet.");

    public string? DockerUnavailableReason { get; private set; }

    /// <summary>Connection string of the throwaway database, as the user that owns every schema.</summary>
    public string ConnectionString => _postgres?.GetConnectionString() ?? throw new InvalidOperationException("Postgres is not running.");

    public async ValueTask InitializeAsync()
    {
        // Program ends with RunJasperFxCommands; this lets WebApplicationFactory start the host normally.
        JasperFxEnvironment.AutoStartHost = true;

        try
        {
            _postgres = new PostgreSqlBuilder("postgres:17-alpine")
                .WithDatabase("aptiverse")
                .WithUsername("aptiverse")
                .WithPassword("aptiverse")
                .Build();
            await _postgres.StartAsync();
            DockerAvailable = true;
        }
#pragma warning disable CA1031 // Any failure to start Docker means the suite is skipped, not failed.
        catch (Exception ex)
#pragma warning restore CA1031
        {
            DockerUnavailableReason = $"Docker is not available for Testcontainers: {ex.GetType().Name}";
            return;
        }

        await using var scope = Services.CreateAsyncScope();
        foreach (var migrator in scope.ServiceProvider.GetServices<IModuleMigrator>())
        {
            await migrator.MigrateAsync(CancellationToken.None);
        }

        foreach (var seeder in scope.ServiceProvider.GetServices<IDataSeeder>())
        {
            await seeder.SeedAsync(CancellationToken.None);
        }
    }

    /// <summary>A client signed in as the given user with the given role (student by default).</summary>
    public HttpClient CreateUserClient(Guid userId, string role = "student")
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, role);
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserHeader, userId.ToString());
        return client;
    }

    public HttpClient CreateAdminClient()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, "admin");
        return client;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Aptiverse", _postgres?.GetConnectionString() ?? string.Empty);
        builder.UseSetting("Messaging:AutoBuildStorage", "true");
        builder.UseSetting("Messaging:SoloMode", "true");
        builder.UseSetting("RateLimiting:PermitLimit", "10000");
        builder.UseSetting("AiService:BaseUrl", "http://ai.test:8080");
        builder.UseSetting("AiService:DailyMessageLimit", DailyMessageLimit.ToString(System.Globalization.CultureInfo.InvariantCulture));
        builder.UseSetting("AiService:SendMessagePermitLimit", "1000");

        // Outside Development the signing key is required; service tokens need it even though tests sign in with the test scheme.
        using (var key = ECDsa.Create(ECCurve.NamedCurves.nistP256))
        {
            builder.UseSetting("Auth:SigningKey", key.ExportPkcs8PrivateKeyPem());
        }

        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
            services.AddHttpClient(AiServiceClient.HttpClientName)
                .ConfigurePrimaryHttpMessageHandler(() => new StubAiHandler(AiStub));
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        _host = base.CreateHost(builder);
        return _host;
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        if (_postgres is not null)
        {
            await _postgres.DisposeAsync();
        }
    }
}

[CollectionDefinition(Name)]
public sealed class ApiTestGroup : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
