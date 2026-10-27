using Aptiverse.Mcp.Domain;
using Aptiverse.Mcp.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Mcp.Persistence;

internal sealed class McpDbContext(DbContextOptions<McpDbContext> options) : ModuleDbContext(options)
{
    public DbSet<ToolCallAudit> ToolCalls => Set<ToolCallAudit>();

    protected override string Schema => McpModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfiguration(new ToolCallAuditConfiguration());
}
