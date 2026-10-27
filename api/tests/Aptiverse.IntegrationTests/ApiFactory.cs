using System.Security.Cryptography;
using Aptiverse.AiTutor.AiService;
using Aptiverse.Billing.Paystack;
using Aptiverse.Identity.Authentication;
using Aptiverse.Notifications.Email;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Seeding;
using JasperFx.CommandLine;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
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

    /// <summary>Stands in for Google's token validation in Google sign-in tests.</summary>
    internal StubGoogleTokenValidator Google { get; } = new();

    /// <summary>Captures every email the Notifications module sends instead of handing it to SES or SMTP.</summary>
    internal RecordingEmailSender Email { get; } = new();

    /// <summary>Every log entry the app writes, for asserting that no personal data reaches the logs.</summary>
    public CapturingLoggerProvider Logs { get; } = new();

    /// <summary>The web app origin email links must use. Deliberately not Auth:WebAppUrl, so tests prove where links come from.</summary>
    public const string EmailWebAppUrl = "https://app.aptiverse.test";

    /// <summary>The fake ai service every AiTutor call goes to.</summary>
    public StubAiService AiStub { get; } = new();

    /// <summary>The fake Paystack every Billing call goes to.</summary>
    public StubPaystack Paystack { get; } = new();

    /// <summary>A fake test key, never a real one. Webhooks in tests are signed with it.</summary>
    public const string PaystackSecret = "sk_test_integration_only_not_a_real_key";

    public const string BillingCallbackUrl = "https://app.aptiverse.test/welcome";

    /// <summary>
    /// The free plan's monthly allowances are raised to this in tests, so suites that exercise the daily caps are not
    /// stopped by the (much smaller) real free allowance first. Billing tests exhaust it on purpose.
    /// </summary>
    public const int TestFreeAllowance = 1000;

    /// <summary>Daily tutor message limit in tests, low so the limit is cheap to reach.</summary>
    public const int DailyMessageLimit = 3;

    /// <summary>Daily practice generation limit in tests.</summary>
    public const int DailyGenerationLimit = 4;

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

        var billing = scope.ServiceProvider.GetRequiredService<Aptiverse.Billing.Persistence.BillingDbContext>();
        await billing.Database.ExecuteSqlAsync(
            $"UPDATE billing.plan_quotas SET per_period = {TestFreeAllowance} WHERE plan_id = (SELECT id FROM billing.plans WHERE code = 'free')");
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
        builder.UseSetting("Academics:WritePermitLimit", "10000");
        builder.UseSetting("Practice:DailyGenerationLimit", DailyGenerationLimit.ToString(System.Globalization.CultureInfo.InvariantCulture));
        builder.UseSetting("Practice:GeneratePermitLimit", "10000");
        builder.UseSetting("Practice:SubmitPermitLimit", "10000");
        builder.UseSetting("Practice:AutosavePermitLimit", "10000");
        builder.UseSetting("Practice:FocusPermitLimit", "10000");

        builder.UseSetting("Billing:Paystack:SecretKey", PaystackSecret);
        builder.UseSetting("Billing:CallbackUrl", BillingCallbackUrl);
        builder.UseSetting("Billing:ScheduleReconciliation", "false");
        builder.UseSetting("Billing:CheckoutPermitLimit", "10000");
        builder.UseSetting("Billing:VerifyPermitLimit", "10000");
        builder.UseSetting("Billing:InboxRetrySeconds", "3600");

        builder.UseSetting("Email:Sender", "Smtp");
        builder.UseSetting("Email:FromAddress", "noreply@aptiverse.test");
        builder.UseSetting("Email:WebAppUrl", EmailWebAppUrl);
        builder.UseSetting("Email:AddressHashPepper", "integration-test-pepper");

        // Tests drive polls and retries by hand; the scheduled ones must not race them.
        builder.UseSetting("Practice:GenerationPollSeconds", "3600");
        builder.UseSetting("Practice:RetryBaseSeconds", "3600");

        // Outside Development the signing key is required; service tokens need it even though tests sign in with the test scheme.
        using (var key = ECDsa.Create(ECCurve.NamedCurves.nistP256))
        {
            builder.UseSetting("Auth:SigningKey", key.ExportPkcs8PrivateKeyPem());
        }

        builder.ConfigureTestServices(services =>
        {
            // Requests without the test headers go to the real ES256 bearer handler, so the identity tests exercise
            // genuine access tokens and session revocation.
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, options =>
                    options.ForwardDefaultSelector = context =>
                        context.Request.Headers.ContainsKey(TestAuthHandler.RoleHeader) ? null : JwtBearerDefaults.AuthenticationScheme);
            services.RemoveAll<IGoogleTokenValidator>();
            services.AddSingleton<IGoogleTokenValidator>(Google);
            services.AddSingleton<IStartupFilter, TestClientIpStartupFilter>();
            services.RemoveAll<IEmailSender>();
            services.AddSingleton<IEmailSender>(Email);
            services.AddSingleton<ILoggerProvider>(Logs);
            services.Configure<LoggerFilterOptions>(options =>
            {
                options.AddFilter<CapturingLoggerProvider>(null, LogLevel.Information);
                options.AddFilter<CapturingLoggerProvider>("Aptiverse", LogLevel.Debug);
                options.AddFilter<CapturingLoggerProvider>("Wolverine", LogLevel.Debug);
            });
            services.AddHttpClient(AiServiceClient.HttpClientName)
                .ConfigurePrimaryHttpMessageHandler(() => new StubAiHandler(AiStub));
            services.AddHttpClient(PaystackClient.HttpClientName)
                .ConfigurePrimaryHttpMessageHandler(() => new StubPaystackHandler(Paystack));
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

/// <summary>
/// Sets the client address from a test header before anything else runs, so rate limits partitioned by IP can be
/// exercised per test instead of every request sharing one "unknown" address.
/// </summary>
internal sealed class TestClientIpStartupFilter : IStartupFilter
{
    public const string Header = "X-Test-Client-Ip";

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
    {
        app.Use((context, nextMiddleware) =>
        {
            if (context.Request.Headers.TryGetValue(Header, out var value) && System.Net.IPAddress.TryParse(value.ToString(), out var address))
            {
                context.Connection.RemoteIpAddress = address;
            }

            return nextMiddleware(context);
        });
        next(app);
    };
}

[CollectionDefinition(Name)]
public sealed class ApiTestGroup : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
