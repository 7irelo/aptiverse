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
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

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

// Seed roles on first run (uses auth-provider's RoleSeeder).
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await AuthDb.RoleSeeder.SeedAsync(roleManager);
}

app.UseCors("AllowNextJS");
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();
app.UseHttpsRedirection();
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
