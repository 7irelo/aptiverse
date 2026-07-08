// Aptiverse.Api — consolidated host that runs auth-provider + all 14 .NET
// domain modules in a single process. This is the modular monolith: each
// domain still ships its own Application/Infrastructure projects with
// its own DbContext and bounded context, but they share one runtime.
//
// To split a module out later: copy its Application+Infrastructure
// projects into a new host, drop the references in this csproj, and
// route the matching API path at the gateway.

using Aptiverse.Auth;             // AddInfrastructure (host-level wire-up)
using Aptiverse.Auth.Middleware;   // filter classes
using Aptiverse.Auth.Utilities;    // BearerSecuritySchemeTransformer
using AuthDb = Aptiverse.Infrastructure.Data;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;

// ---------------------------------------------------------------------------
// Local-dev .env loader. Reads api/.env when running natively (i.e. not in
// the Docker stack) so `dotnet run` works without having to source the file
// into the shell first. No-op in Production — .env shouldn't ship anyway.
//
// The .env contains the SSH-tunnelled RDS connection string and any local
// API keys (ANTHROPIC_API_KEY, etc.); without this loader, appsettings.json
// wins and tries to resolve `Host=postgres` (the docker-compose service
// name) which doesn't exist outside the compose network → 11001 "No such
// host is known".
//
// Existing env vars take precedence — CI / docker-compose can still inject
// theirs without being overwritten by stale local .env values.
// ---------------------------------------------------------------------------
LoadDotEnvIfDevelopment();

var builder = WebApplication.CreateBuilder(args);

static void LoadDotEnvIfDevelopment()
{
    // Skip on a real production host. We treat anything explicitly tagged
    // Production / Staging as "not dev". If the env var is unset (the
    // default state when a developer runs `dotnet run` from PowerShell)
    // we proceed — that's exactly the case the .env loader exists for.
    var envName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
    if (string.Equals(envName, "Production", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(envName, "Staging", StringComparison.OrdinalIgnoreCase))
    {
        return;
    }

    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (!File.Exists(envPath)) return;

    foreach (var raw in File.ReadAllLines(envPath))
    {
        var line = raw.Trim();
        if (line.Length == 0 || line.StartsWith('#')) continue;

        var eq = line.IndexOf('=');
        if (eq <= 0) continue;

        var key = line[..eq].Trim();
        var value = line[(eq + 1)..].Trim();
        // Strip matched surrounding quotes (env files sometimes have them).
        if (value.Length >= 2 &&
            ((value.StartsWith('"') && value.EndsWith('"')) ||
             (value.StartsWith('\'') && value.EndsWith('\''))))
        {
            value = value[1..^1];
        }

        // Don't overwrite anything the user already set in their shell or
        // anything CI/compose injected — explicit beats file.
        if (Environment.GetEnvironmentVariable(key) is not null) continue;
        Environment.SetEnvironmentVariable(key, value);
    }
}

// -----------------------------------------------------------------------
// Auth-provider wiring (Identity, JWT, Redis, EmailSender, Token storage).
// AddInfrastructure also calls AddApplicationServices and adds AutoMapper
// for the Application assembly markers.
// -----------------------------------------------------------------------
builder.Services.AddInfrastructure(builder.Configuration);

// -----------------------------------------------------------------------
// Module Application registrations — Application layer DI per module.
// We DO NOT call each module's AddInfrastructureServices here because
// every module's Infrastructure tries to re-register Redis + HealthChecks
// which would collide. Module DbContexts and repositories are wired in
// ModuleRegistrations.RegisterDomainModules below.
// -----------------------------------------------------------------------
Aptiverse.Api.Modules.ModuleRegistrations.RegisterDomainModules(builder.Services, builder.Configuration);

// -----------------------------------------------------------------------
// MVC pipeline + filters from auth-provider host.
// -----------------------------------------------------------------------
builder.Services.AddControllers(opt =>
{
    opt.Filters.Add<NullResultFilter>();
    opt.Filters.Add<ValidationFilter>();
    opt.Filters.Add<ExceptionHandlingFilter>();
    opt.Filters.Add<LoggingFilter>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});
builder.Services.AddAntiforgery();

var app = builder.Build();

// Seed Identity roles on first run (idempotent). This is structural —
// the Student / Teacher / Admin / etc. role definitions need to exist
// before users can be assigned to them. No demo content is seeded
// anywhere; every account starts empty and the user creates their own
// goals, subjects, diary entries, etc.
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await AuthDb.RoleSeeder.SeedAsync(roleManager);

    // Curriculum catalog seed — structural data (NSC + IEB + canonical
    // FET subjects). Idempotent; skips after the first boot.
    var db = scope.ServiceProvider.GetRequiredService<Aptiverse.Api.Data.ApplicationDbContext>();
    await Aptiverse.AcademicPlanning.Infrastructure.Data.CurriculumCatalogSeeder.SeedAsync(db);

    // Entitlements catalog — Plan rows + PlanFeature mappings. Mirrors
    // the public pricing page (free / student / family / school).
    await Aptiverse.Entitlements.Infrastructure.Data.EntitlementsCatalogSeeder.SeedAsync(db);

    // Test-user seeding is intentionally DISABLED — accounts are created only
    // through the real signup flow. (Re-enable DevTestUsersSeeder here only if
    // you explicitly want throwaway dev accounts.)

    // Paystack recurring billing: mint a PLN_ plan per paid tier + interval
    // and store the codes on the Plan rows so checkout can start a real
    // auto-renewing subscription. Idempotent + best-effort; a no-op when
    // no secret key is configured.
    var paystackClient = scope.ServiceProvider
        .GetRequiredService<Aptiverse.Entitlements.Infrastructure.Paystack.IPaystackClient>();
    var paystackLogger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
        .CreateLogger("PaystackPlanSyncer");
    await Aptiverse.Entitlements.Infrastructure.Data.PaystackPlanSyncer.SyncAsync(
        db, paystackClient, paystackLogger);
}

// Trust Cloudflare's X-Forwarded-Proto / X-Forwarded-For so Request.Scheme
// reflects the original HTTPS scheme (CF→origin is plain HTTP in Flexible
// mode). Without this, Scalar/OpenAPI generate http:// URLs that browsers
// block as mixed content from the HTTPS-loaded UI.
var forwardedHeaders = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
};
forwardedHeaders.KnownNetworks.Clear();
forwardedHeaders.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeaders);

app.UseCors("AllowNextJS");
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health endpoint (root) for orchestration probes.
app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "aptiverse-api",
    modules = new[]
    {
        "auth", "academic-planning", "audit", "booking", "calendar",
        "entitlements", "feature-flags", "goals", "insights", "marketplace",
        "mastery", "moderation", "practice", "support", "wellbeing",
    },
    ts = DateTime.UtcNow,
}));

// OpenAPI + Scalar UI at /scalar; ReDoc at /docs.
app.MapOpenApi();
app.MapScalarApiReference("dev", options =>
{
    options
        .WithTitle("Aptiverse API (consolidated)")
        .WithTheme(ScalarTheme.Purple)
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
});

app.UseReDoc(options =>
{
    options.RoutePrefix = "docs";
    options.DocumentTitle = "Aptiverse API";
    options.SpecUrl = "/openapi/v1.json";
});

app.Run();
