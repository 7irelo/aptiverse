using Aptiverse.Academics;
using Aptiverse.AiTutor;
using Aptiverse.Identity;
using Aptiverse.Notifications;
using Aptiverse.Practice;
using Aptiverse.Progress;
using Aptiverse.SharedKernel.Hosting;
using Aptiverse.Support;
using JasperFx;

// Background role: same modules as the API, no endpoints besides health. Wolverine here processes durable
// local queues, recovers outbox and inbox envelopes, and fires scheduled messages, so background work keeps
// running regardless of how the API scales.
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
});

builder.AddPlatform("aptiverse-worker");

builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddSupportModule(builder.Configuration);
builder.Services.AddAiTutorModule(builder.Configuration);
builder.Services.AddAcademicsModule(builder.Configuration);
builder.Services.AddPracticeModule(builder.Configuration);
builder.Services.AddProgressModule(builder.Configuration);
builder.Services.AddNotificationsModule(builder.Configuration);

var app = builder.Build();

app.MapPlatformHealthChecks();

return await app.RunJasperFxCommands(args);
