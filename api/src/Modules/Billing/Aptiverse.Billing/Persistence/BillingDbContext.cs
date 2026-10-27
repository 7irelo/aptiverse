using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Billing.Persistence;

internal sealed class BillingDbContext(DbContextOptions<BillingDbContext> options) : ModuleDbContext(options)
{
    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<PlanPrice> PlanPrices => Set<PlanPrice>();

    public DbSet<PlanFeature> PlanFeatures => Set<PlanFeature>();

    public DbSet<PlanQuota> PlanQuotas => Set<PlanQuota>();

    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    public DbSet<SubscriptionTransition> SubscriptionTransitions => Set<SubscriptionTransition>();

    public DbSet<CheckoutSession> CheckoutSessions => Set<CheckoutSession>();

    public DbSet<Payment> Payments => Set<Payment>();

    public DbSet<Refund> Refunds => Set<Refund>();

    public DbSet<LedgerEntry> LedgerEntries => Set<LedgerEntry>();

    public DbSet<Invoice> Invoices => Set<Invoice>();

    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();

    public DbSet<InvoiceSequence> InvoiceSequences => Set<InvoiceSequence>();

    public DbSet<PaystackEvent> PaystackEvents => Set<PaystackEvent>();

    public DbSet<UsageMeter> UsageMeters => Set<UsageMeter>();

    public DbSet<UsageReservation> UsageReservations => Set<UsageReservation>();

    public DbSet<FeatureUsage> FeatureUsage => Set<FeatureUsage>();

    public DbSet<ReconciliationRun> ReconciliationRuns => Set<ReconciliationRun>();

    public DbSet<ReconciliationDrift> ReconciliationDrifts => Set<ReconciliationDrift>();

    protected override string Schema => BillingModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PlanConfiguration());
        modelBuilder.ApplyConfiguration(new PlanPriceConfiguration());
        modelBuilder.ApplyConfiguration(new PlanFeatureConfiguration());
        modelBuilder.ApplyConfiguration(new PlanQuotaConfiguration());
        modelBuilder.ApplyConfiguration(new SubscriptionConfiguration());
        modelBuilder.ApplyConfiguration(new SubscriptionTransitionConfiguration());
        modelBuilder.ApplyConfiguration(new CheckoutSessionConfiguration());
        modelBuilder.ApplyConfiguration(new PaymentConfiguration());
        modelBuilder.ApplyConfiguration(new RefundConfiguration());
        modelBuilder.ApplyConfiguration(new LedgerEntryConfiguration());
        modelBuilder.ApplyConfiguration(new InvoiceConfiguration());
        modelBuilder.ApplyConfiguration(new InvoiceLineConfiguration());
        modelBuilder.ApplyConfiguration(new InvoiceSequenceConfiguration());
        modelBuilder.ApplyConfiguration(new PaystackEventConfiguration());
        modelBuilder.ApplyConfiguration(new UsageMeterConfiguration());
        modelBuilder.ApplyConfiguration(new UsageReservationConfiguration());
        modelBuilder.ApplyConfiguration(new FeatureUsageConfiguration());
        modelBuilder.ApplyConfiguration(new ReconciliationRunConfiguration());
        modelBuilder.ApplyConfiguration(new ReconciliationDriftConfiguration());
    }
}
