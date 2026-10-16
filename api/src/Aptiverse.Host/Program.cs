using Aptiverse.Host.Infrastructure;
using Aptiverse.SharedKernel.Hosting;
using Aptiverse.Support;
using JasperFx;
using Scalar.AspNetCore;

var command = args is [SeedCommand.Name or MigrateCommand.Name, ..] ? args[0] : null;

// Content root is the app folder, not the working directory, so one image can host both roles side by side.
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = command is null ? args : args[1..],
    ContentRootPath = AppContext.BaseDirectory,
});

builder.AddPlatform("aptiverse-api");
builder.Services.AddApiPlatform(builder.Configuration);

// Modules: each exposes AddXModule + MapXEndpoints and nothing else.
builder.Services.AddSupportModule(builder.Configuration);

var app = builder.Build();

switch (command)
{
    case SeedCommand.Name:
        return await SeedCommand.RunAsync(app);
    case MigrateCommand.Name:
        return await MigrateCommand.RunAsync(app);
}

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors(ApiServiceCollectionExtensions.CorsPolicy);
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapPlatformHealthChecks();
app.MapSupportEndpoints();

if (PlatformHostingExtensions.IsBuildTimeDocumentGeneration)
{
    // Build-time OpenAPI generation hosts the app itself and cannot go through the JasperFx command runner.
    await app.RunAsync();
    return 0;
}

// No database migrations on boot: they run as a separate step (the `migrate` command).
// JasperFx adds operational commands such as `resources setup` and `codegen`; with no args it runs the host.
return await app.RunJasperFxCommands(args);
