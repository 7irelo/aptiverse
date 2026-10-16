using System.Security.Claims;
using System.Text.Json;
using Aptiverse.Api.Data;
using Aptiverse.Audit.Domain.Models.Audit;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Api.Services.Audit
{
    // Writes rows into the append-only audit trail (audit.audit_logs, joined to
    // the audit.audit_actions catalogue).
    //
    // The tables and the read projection existed long before anything wrote to
    // them, which is why /admin/audit rendered an empty page under a header
    // promising "every admin action, immutable". This is the writer half. It
    // needs no schema change: both tables are already in the database.
    //
    // Every column on AuditLog is NOT NULL, so this service normalises nulls to
    // empty strings rather than letting a caller trip a constraint. Recording is
    // best effort by contract: an audit write must never be the reason an admin
    // action fails, so callers use RecordAsync and ignore the result, and every
    // exception is swallowed and logged here.
    public interface IAuditTrail
    {
        Task RecordAsync(AuditEntry entry, CancellationToken ct = default);
    }

    // One auditable thing that happened. Action is the catalogue name, in
    // "Noun.Verb" form ("User.RolesChanged"). Category groups actions in the
    // admin filter; severity drives the colour of the row.
    public sealed record AuditEntry
    {
        public required string Action { get; init; }
        public string Category { get; init; } = "Admin";
        public AuditSeverity Severity { get; init; } = AuditSeverity.Info;

        // What was acted on. EntityType is a stable noun ("User",
        // "Subscription"); EntityId is that record's id.
        public string EntityType { get; init; } = "";
        public string EntityId { get; init; } = "";

        // Before / after snapshots. Serialised to JSON; keep them small and
        // free of secrets, they are read back verbatim by the admin viewer.
        public object? OldValues { get; init; }
        public object? NewValues { get; init; }

        // Who acted. Left null, the trail reads the current request's principal.
        public ClaimsPrincipal? Actor { get; init; }
    }

    public sealed class AuditTrail(
        ApplicationDbContext db,
        IHttpContextAccessor http,
        ILogger<AuditTrail> logger) : IAuditTrail
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IHttpContextAccessor _http = http;
        private readonly ILogger<AuditTrail> _logger = logger;

        private const string ServiceName = "aptiverse-api";

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        // Audit values are a record, not a payload to replay, so a runaway
        // snapshot is truncated rather than stored whole.
        private const int MaxValueLength = 4000;

        public async Task RecordAsync(AuditEntry entry, CancellationToken ct = default)
        {
            try
            {
                var ctx = _http.HttpContext;
                var principal = entry.Actor ?? ctx?.User;

                var actionId = await ResolveActionIdAsync(entry, ct);

                var log = new AuditLog
                {
                    UserId = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? principal?.FindFirst("sub")?.Value
                        ?? "",
                    UserEmail = principal?.FindFirstValue(ClaimTypes.Email)
                        ?? principal?.Identity?.Name
                        ?? "",
                    UserRole = string.Join(",", principal?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? []),
                    ActionId = actionId,
                    EntityType = entry.EntityType ?? "",
                    EntityId = entry.EntityId ?? "",
                    ServiceName = ServiceName,
                    OldValues = Serialise(entry.OldValues),
                    NewValues = Serialise(entry.NewValues),
                    IpAddress = ctx?.Connection.RemoteIpAddress?.ToString() ?? "",
                    UserAgent = Truncate(ctx?.Request.Headers.UserAgent.FirstOrDefault() ?? "", 512),
                    CorrelationId = ctx?.TraceIdentifier ?? "",
                    CreatedAt = DateTime.UtcNow,
                };

                _db.Set<AuditLog>().Add(log);
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                // Deliberately swallowed. The action the admin took has already
                // happened; failing their request because the record of it did
                // not persist would be the worse outcome, and the log line here
                // is the trail of last resort.
                _logger.LogError(ex,
                    "Audit write failed for action {Action} on {EntityType} {EntityId}.",
                    entry.Action, entry.EntityType, entry.EntityId);
            }
        }

        // The action catalogue is data, not an enum, so a new auditable action
        // introduces itself the first time it fires instead of needing a
        // migration or a seeder to be run first.
        private async Task<long> ResolveActionIdAsync(AuditEntry entry, CancellationToken ct)
        {
            var existing = await _db.Set<AuditAction>()
                .Where(a => a.Name == entry.Action)
                .Select(a => (long?)a.Id)
                .FirstOrDefaultAsync(ct);
            if (existing is { } id) return id;

            var action = new AuditAction
            {
                Name = entry.Action,
                Description = entry.Action,
                Category = entry.Category,
                Severity = entry.Severity,
                IsActive = true,
            };
            _db.Set<AuditAction>().Add(action);
            await _db.SaveChangesAsync(ct);
            return action.Id;
        }

        private static string Serialise(object? value)
        {
            if (value is null) return "";
            try
            {
                return Truncate(JsonSerializer.Serialize(value, JsonOpts), MaxValueLength);
            }
            catch
            {
                return "";
            }
        }

        private static string Truncate(string value, int max)
            => value.Length <= max ? value : value[..max];
    }
}
