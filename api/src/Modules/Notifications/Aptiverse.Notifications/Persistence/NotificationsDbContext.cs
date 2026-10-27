using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Notifications.Persistence;

internal sealed class NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : ModuleDbContext(options)
{
    public DbSet<EmailDelivery> Deliveries => Set<EmailDelivery>();

    protected override string Schema => NotificationsModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfiguration(new EmailDeliveryConfiguration());
}
