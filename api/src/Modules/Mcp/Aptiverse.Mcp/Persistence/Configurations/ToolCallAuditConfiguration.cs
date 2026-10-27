using Aptiverse.Mcp.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Mcp.Persistence.Configurations;

internal sealed class ToolCallAuditConfiguration : IEntityTypeConfiguration<ToolCallAudit>
{
    public void Configure(EntityTypeBuilder<ToolCallAudit> builder)
    {
        builder.ToTable("tool_calls", t => t.HasCheckConstraint("ck_tool_calls_latency_ms", "latency_ms >= 0"));

        builder.Property(a => a.UserId).IsRequired();
        builder.Property(a => a.Tool).HasMaxLength(ToolCallAudit.ToolMaxLength).IsRequired();
        builder.Property(a => a.Scope).HasMaxLength(ToolCallAudit.ScopeMaxLength).IsRequired();
        builder.Property(a => a.Outcome).HasMaxLength(ToolCallAudit.OutcomeMaxLength).IsRequired();
        builder.Property(a => a.LatencyMs).IsRequired();
        builder.Property(a => a.Client).HasMaxLength(ToolCallAudit.ClientMaxLength).IsRequired();
        builder.Property(a => a.TokenId).HasMaxLength(ToolCallAudit.TokenIdMaxLength);
        builder.Property(a => a.RequestId).HasMaxLength(ToolCallAudit.RequestIdMaxLength);

        // Serves the per-user audit view, newest first.
        builder.HasIndex(a => new { a.UserId, a.CreatedAt });
    }
}
