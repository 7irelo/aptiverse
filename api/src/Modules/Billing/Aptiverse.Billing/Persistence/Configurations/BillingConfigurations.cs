using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Billing.Persistence.Configurations;

internal static class MoneyColumns
{
    public const string ZarOnly = "currency = 'ZAR'";

    public static PropertyBuilder<string> Currency(PropertyBuilder<string> property) =>
        property.HasMaxLength(Currencies.Length).IsFixedLength().IsRequired();
}

internal sealed class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("plans", t =>
        {
            t.HasCheckConstraint("ck_plans_kind", CheckConstraints.In("kind", PlanKinds.All));
            t.HasCheckConstraint("ck_plans_audience", CheckConstraints.In("audience", Audiences.All));
            t.HasCheckConstraint("ck_plans_max_seats", "max_seats BETWEEN 1 AND 10");
        });
        builder.Property(p => p.Code).HasMaxLength(PlanCodes.MaxLength).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(Plan.NameMaxLength).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(Plan.DescriptionMaxLength).IsRequired();
        builder.Property(p => p.Kind).HasMaxLength(16).IsRequired();
        builder.Property(p => p.Audience).HasMaxLength(16).IsRequired();
        builder.HasIndex(p => p.Code).IsUnique();
    }
}

internal sealed class PlanPriceConfiguration : IEntityTypeConfiguration<PlanPrice>
{
    public void Configure(EntityTypeBuilder<PlanPrice> builder)
    {
        builder.ToTable("plan_prices", t =>
        {
            t.HasCheckConstraint("ck_plan_prices_interval", CheckConstraints.In("interval", Intervals.All));
            t.HasCheckConstraint("ck_plan_prices_amount", "amount_cents > 0");
            t.HasCheckConstraint("ck_plan_prices_currency", MoneyColumns.ZarOnly);
        });
        builder.Property(p => p.Interval).HasMaxLength(16).IsRequired();
        MoneyColumns.Currency(builder.Property(p => p.Currency));
        builder.Property(p => p.PaystackPlanCode).HasMaxLength(PlanPrice.PaystackCodeMaxLength);
        builder.HasOne<Plan>().WithMany().HasForeignKey(p => p.PlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(p => new { p.PlanId, p.Interval }).IsUnique().HasFilter("is_active AND deleted_at IS NULL");
        builder.HasIndex(p => p.PaystackPlanCode).IsUnique().HasFilter("paystack_plan_code IS NOT NULL");
    }
}

internal sealed class PlanFeatureConfiguration : IEntityTypeConfiguration<PlanFeature>
{
    public void Configure(EntityTypeBuilder<PlanFeature> builder)
    {
        builder.ToTable("plan_features");
        builder.Property(f => f.FeatureKey).HasMaxLength(FeatureKeys.MaxLength).IsRequired();
        builder.Property(f => f.Label).HasMaxLength(PlanFeature.LabelMaxLength).IsRequired();
        builder.HasOne<Plan>().WithMany().HasForeignKey(f => f.PlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(f => new { f.PlanId, f.FeatureKey }).IsUnique();
        builder.HasIndex(f => f.FeatureKey);
    }
}

internal sealed class PlanQuotaConfiguration : IEntityTypeConfiguration<PlanQuota>
{
    public void Configure(EntityTypeBuilder<PlanQuota> builder)
    {
        builder.ToTable("plan_quotas", t =>
        {
            t.HasCheckConstraint("ck_plan_quotas_per_period", "per_period >= -1");
            t.HasCheckConstraint("ck_plan_quotas_quota_key", CheckConstraints.In("quota_key", QuotaKeys.All));
        });
        builder.Property(q => q.QuotaKey).HasMaxLength(QuotaKeys.MaxLength).IsRequired();
        builder.HasOne<Plan>().WithMany().HasForeignKey(q => q.PlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(q => new { q.PlanId, q.QuotaKey }).IsUnique();
    }
}

internal sealed class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public const string OneHoldingPerAudienceIndex = "ux_subscriptions_owner_audience_holding";

    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("subscriptions", t =>
        {
            t.HasCheckConstraint("ck_subscriptions_status", CheckConstraints.In("status", SubscriptionStatuses.All));
            t.HasCheckConstraint("ck_subscriptions_audience", CheckConstraints.In("audience", Audiences.All));
            t.HasCheckConstraint("ck_subscriptions_interval", "interval IS NULL OR " + CheckConstraints.In("interval", Intervals.All));
            t.HasCheckConstraint("ck_subscriptions_failures", "renewal_failure_count >= 0");
        });
        builder.Property(s => s.Audience).HasMaxLength(16).IsRequired();
        builder.Property(s => s.Status).HasMaxLength(SubscriptionStatuses.MaxLength).IsRequired();
        builder.Property(s => s.Interval).HasMaxLength(16);
        builder.Property(s => s.CancelReason).HasMaxLength(Subscription.CancelReasonMaxLength);
        builder.Property(s => s.PaystackSubscriptionCode).HasMaxLength(Subscription.PaystackCodeMaxLength);
        builder.Property(s => s.PaystackCustomerCode).HasMaxLength(Subscription.PaystackCodeMaxLength);

        builder.HasOne<Plan>().WithMany().HasForeignKey(s => s.PlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<PlanPrice>().WithMany().HasForeignKey(s => s.PlanPriceId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => new { s.OwnerUserId, s.Audience })
            .HasDatabaseName(OneHoldingPerAudienceIndex)
            .IsUnique()
            .HasFilter($"{CheckConstraints.In("status", SubscriptionStatuses.Holding)} AND deleted_at IS NULL");
        builder.HasIndex(s => s.OwnerUserId);
        builder.HasIndex(s => s.PlanId);
        builder.HasIndex(s => s.PlanPriceId);
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.CurrentPeriodEnd);
        builder.HasIndex(s => s.PaystackCustomerCode);
        builder.HasIndex(s => s.PaystackSubscriptionCode).IsUnique().HasFilter("paystack_subscription_code IS NOT NULL");
    }
}

internal sealed class SubscriptionTransitionConfiguration : IEntityTypeConfiguration<SubscriptionTransition>
{
    public void Configure(EntityTypeBuilder<SubscriptionTransition> builder)
    {
        builder.ToTable("subscription_transitions", t =>
            t.HasCheckConstraint("ck_subscription_transitions_trigger_type", CheckConstraints.In("trigger_type", TriggerTypes.All)));
        builder.Property(t => t.FromStatus).HasMaxLength(SubscriptionStatuses.MaxLength);
        builder.Property(t => t.ToStatus).HasMaxLength(SubscriptionStatuses.MaxLength).IsRequired();
        builder.Property(t => t.Transition).HasMaxLength(SubscriptionStateMachine.IdMaxLength).IsRequired();
        builder.Property(t => t.TriggerType).HasMaxLength(16).IsRequired();
        builder.Property(t => t.TriggerRef).HasMaxLength(SubscriptionTransition.TriggerRefMaxLength);
        builder.HasOne<Subscription>().WithMany().HasForeignKey(t => t.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(t => new { t.SubscriptionId, t.OccurredAt });
    }
}

internal sealed class CheckoutSessionConfiguration : IEntityTypeConfiguration<CheckoutSession>
{
    public void Configure(EntityTypeBuilder<CheckoutSession> builder)
    {
        builder.ToTable("checkout_sessions", t =>
        {
            t.HasCheckConstraint("ck_checkout_sessions_purpose", CheckConstraints.In("purpose", CheckoutPurposes.All));
            t.HasCheckConstraint("ck_checkout_sessions_status", CheckConstraints.In("status", CheckoutStatuses.All));
            t.HasCheckConstraint("ck_checkout_sessions_amount", "amount_cents > 0");
            t.HasCheckConstraint("ck_checkout_sessions_currency", MoneyColumns.ZarOnly);
        });
        builder.Property(c => c.Purpose).HasMaxLength(20).IsRequired();
        builder.Property(c => c.Reference).HasMaxLength(CheckoutSession.ReferenceMaxLength).IsRequired();
        builder.Property(c => c.AccessCode).HasMaxLength(CheckoutSession.AccessCodeMaxLength);
        builder.Property(c => c.AuthorizationUrl).HasMaxLength(CheckoutSession.AuthorizationUrlMaxLength);
        builder.Property(c => c.Status).HasMaxLength(16).IsRequired();
        builder.Property(c => c.IdempotencyKey).HasMaxLength(CheckoutSession.IdempotencyKeyMaxLength);
        MoneyColumns.Currency(builder.Property(c => c.Currency));
        builder.HasOne<PlanPrice>().WithMany().HasForeignKey(c => c.PlanPriceId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Subscription>().WithMany().HasForeignKey(c => c.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(c => c.Reference).IsUnique();
        builder.HasIndex(c => new { c.UserId, c.Status });
        builder.HasIndex(c => c.PlanPriceId);
        builder.HasIndex(c => c.SubscriptionId);
        builder.HasIndex(c => new { c.UserId, c.IdempotencyKey }).IsUnique().HasFilter("idempotency_key IS NOT NULL");
    }
}

internal sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments", t =>
        {
            t.HasCheckConstraint("ck_payments_status", CheckConstraints.In("status", PaymentStatuses.All));
            t.HasCheckConstraint("ck_payments_purpose", CheckConstraints.In("purpose", PaymentPurposes.All));
            t.HasCheckConstraint("ck_payments_amount", "amount_cents > 0");
            t.HasCheckConstraint("ck_payments_fees", "fees_cents IS NULL OR fees_cents >= 0");
            t.HasCheckConstraint("ck_payments_currency", MoneyColumns.ZarOnly);
        });
        builder.Property(p => p.PaystackReference).HasMaxLength(Payment.ReferenceMaxLength).IsRequired();
        builder.Property(p => p.Status).HasMaxLength(16).IsRequired();
        builder.Property(p => p.Channel).HasMaxLength(Payment.ChannelMaxLength);
        builder.Property(p => p.Purpose).HasMaxLength(20).IsRequired();
        MoneyColumns.Currency(builder.Property(p => p.Currency));
        builder.HasOne<Invoice>().WithMany().HasForeignKey(p => p.InvoiceId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Subscription>().WithMany().HasForeignKey(p => p.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<CheckoutSession>().WithMany().HasForeignKey(p => p.CheckoutSessionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(p => p.PaystackReference).IsUnique();
        builder.HasIndex(p => p.PaystackTransactionId).IsUnique();
        builder.HasIndex(p => new { p.UserId, p.PaidAt });
        builder.HasIndex(p => p.InvoiceId);
        builder.HasIndex(p => p.SubscriptionId);
        builder.HasIndex(p => p.CheckoutSessionId);
    }
}

internal sealed class RefundConfiguration : IEntityTypeConfiguration<Refund>
{
    public void Configure(EntityTypeBuilder<Refund> builder)
    {
        builder.ToTable("refunds", t =>
        {
            t.HasCheckConstraint("ck_refunds_status", CheckConstraints.In("status", RefundStatuses.All));
            t.HasCheckConstraint("ck_refunds_amount", "amount_cents > 0");
            t.HasCheckConstraint("ck_refunds_currency", MoneyColumns.ZarOnly);
        });
        builder.Property(r => r.Reason).HasMaxLength(Refund.ReasonMaxLength).IsRequired();
        builder.Property(r => r.Status).HasMaxLength(16).IsRequired();
        MoneyColumns.Currency(builder.Property(r => r.Currency));
        builder.HasOne<Payment>().WithMany().HasForeignKey(r => r.PaymentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(r => r.PaymentId);
        builder.HasIndex(r => r.PaystackRefundId).IsUnique().HasFilter("paystack_refund_id IS NOT NULL");
    }
}

internal sealed class LedgerEntryConfiguration : IEntityTypeConfiguration<LedgerEntry>
{
    public void Configure(EntityTypeBuilder<LedgerEntry> builder)
    {
        builder.ToTable("ledger_entries", t =>
        {
            t.HasCheckConstraint("ck_ledger_entries_kind", CheckConstraints.In("kind", LedgerKinds.All));
            t.HasCheckConstraint("ck_ledger_entries_sign", "(kind = 'charge' AND amount_cents > 0) OR (kind <> 'charge' AND amount_cents < 0)");
            t.HasCheckConstraint("ck_ledger_entries_currency", MoneyColumns.ZarOnly);
        });
        builder.Property(l => l.Kind).HasMaxLength(16).IsRequired();
        builder.Property(l => l.Description).HasMaxLength(LedgerEntry.DescriptionMaxLength).IsRequired();
        MoneyColumns.Currency(builder.Property(l => l.Currency));
        builder.HasOne<Payment>().WithMany().HasForeignKey(l => l.PaymentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Refund>().WithMany().HasForeignKey(l => l.RefundId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Invoice>().WithMany().HasForeignKey(l => l.InvoiceId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Subscription>().WithMany().HasForeignKey(l => l.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(l => new { l.UserId, l.OccurredAt });
        builder.HasIndex(l => l.PaymentId);
        builder.HasIndex(l => l.InvoiceId);
        builder.HasIndex(l => l.SubscriptionId);

        // One charge per payment and one row per refund, whatever retries happen.
        builder.HasIndex(l => new { l.PaymentId, l.Kind }).IsUnique().HasFilter("kind = 'charge'").HasDatabaseName("ux_ledger_entries_one_charge_per_payment");
        builder.HasIndex(l => l.RefundId).IsUnique().HasFilter("refund_id IS NOT NULL");
    }
}

internal sealed class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices", t =>
        {
            t.HasCheckConstraint("ck_invoices_status", CheckConstraints.In("status", InvoiceStatuses.All));
            t.HasCheckConstraint("ck_invoices_total", "total_cents = subtotal_cents + vat_cents");
            t.HasCheckConstraint("ck_invoices_vat", "vat_cents >= 0");
            t.HasCheckConstraint("ck_invoices_tax_invoice", "is_tax_invoice OR (vat_cents = 0 AND vat_rate_bps = 0)");
            t.HasCheckConstraint("ck_invoices_currency", MoneyColumns.ZarOnly);
        });
        builder.Property(i => i.Number).HasMaxLength(Invoice.NumberMaxLength).IsRequired();
        builder.Property(i => i.Status).HasMaxLength(20).IsRequired();
        builder.Property(i => i.BillingName).HasMaxLength(Invoice.BillingNameMaxLength).IsRequired();
        builder.Property(i => i.BillingEmail).HasMaxLength(Invoice.BillingEmailMaxLength).IsRequired();
        MoneyColumns.Currency(builder.Property(i => i.Currency));
        builder.HasOne<Subscription>().WithMany().HasForeignKey(i => i.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(i => i.Number).IsUnique();
        builder.HasIndex(i => new { i.UserId, i.IssuedAt });
        builder.HasIndex(i => i.SubscriptionId);
    }
}

internal sealed class InvoiceLineConfiguration : IEntityTypeConfiguration<InvoiceLine>
{
    public void Configure(EntityTypeBuilder<InvoiceLine> builder)
    {
        builder.ToTable("invoice_lines", t =>
        {
            t.HasCheckConstraint("ck_invoice_lines_quantity", "quantity > 0");
            t.HasCheckConstraint("ck_invoice_lines_amount", "amount_cents = quantity * unit_amount_cents");
        });
        builder.Property(l => l.Description).HasMaxLength(InvoiceLine.DescriptionMaxLength).IsRequired();
        builder.HasOne<Invoice>().WithMany().HasForeignKey(l => l.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(l => l.InvoiceId);
    }
}

internal sealed class InvoiceSequenceConfiguration : IEntityTypeConfiguration<InvoiceSequence>
{
    public void Configure(EntityTypeBuilder<InvoiceSequence> builder)
    {
        builder.ToTable("invoice_sequences", t => t.HasCheckConstraint("ck_invoice_sequences_next", "next_value >= 1"));
        builder.HasIndex(s => s.Year).IsUnique();
    }
}

internal sealed class PaystackEventConfiguration : IEntityTypeConfiguration<PaystackEvent>
{
    public void Configure(EntityTypeBuilder<PaystackEvent> builder)
    {
        builder.ToTable("paystack_events", t =>
        {
            t.HasCheckConstraint("ck_paystack_events_source", CheckConstraints.In("source", InboxSources.All));
            t.HasCheckConstraint("ck_paystack_events_status", CheckConstraints.In("status", InboxStatuses.All));
        });
        builder.Property(e => e.DedupeKey).HasMaxLength(PaystackEvent.DedupeKeyLength).IsFixedLength().IsRequired();
        builder.Property(e => e.EventType).HasMaxLength(PaystackEvent.EventTypeMaxLength).IsRequired();
        builder.Property(e => e.ObjectRef).HasMaxLength(PaystackEvent.ObjectRefMaxLength);
        builder.Property(e => e.Payload).HasColumnType("jsonb").IsRequired();
        builder.Property(e => e.BodySha256).HasMaxLength(64).IsFixedLength().IsRequired();
        builder.Property(e => e.Source).HasMaxLength(16).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(16).IsRequired();
        builder.Property(e => e.LastErrorCode).HasMaxLength(PaystackEvent.ErrorCodeMaxLength);
        builder.HasIndex(e => e.DedupeKey).IsUnique();
        builder.HasIndex(e => e.EventType);
        builder.HasIndex(e => e.ObjectRef);
        builder.HasIndex(e => new { e.Status, e.ReceivedAt });
    }
}

internal sealed class UsageMeterConfiguration : IEntityTypeConfiguration<UsageMeter>
{
    public const string PeriodIndex = "ux_usage_meters_subject_period";

    public void Configure(EntityTypeBuilder<UsageMeter> builder)
    {
        builder.ToTable("usage_meters", t =>
        {
            t.HasCheckConstraint("ck_usage_meters_subject_type", CheckConstraints.In("subject_type", MeterSubjects.All));
            t.HasCheckConstraint("ck_usage_meters_used", "used >= 0");
            t.HasCheckConstraint("ck_usage_meters_reserved", "reserved >= 0");
        });
        builder.Property(m => m.SubjectType).HasMaxLength(16).IsRequired();
        builder.Property(m => m.QuotaKey).HasMaxLength(QuotaKeys.MaxLength).IsRequired();

        // A plain unique index (no filter): the reserve upsert targets it with ON CONFLICT.
        builder.HasIndex(m => new { m.SubjectType, m.SubjectId, m.QuotaKey, m.PeriodStart }).IsUnique().HasDatabaseName(PeriodIndex);
    }
}

internal sealed class UsageReservationConfiguration : IEntityTypeConfiguration<UsageReservation>
{
    public void Configure(EntityTypeBuilder<UsageReservation> builder)
    {
        builder.ToTable("usage_reservations", t =>
        {
            t.HasCheckConstraint("ck_usage_reservations_status", CheckConstraints.In("status", ReservationStatuses.All));
            t.HasCheckConstraint("ck_usage_reservations_amount", "amount > 0");
            t.HasCheckConstraint("ck_usage_reservations_confirmed", "confirmed_amount IS NULL OR confirmed_amount >= 0");
        });
        builder.Property(r => r.QuotaKey).HasMaxLength(QuotaKeys.MaxLength).IsRequired();
        builder.Property(r => r.Status).HasMaxLength(16).IsRequired();
        builder.Property(r => r.Correlation).HasMaxLength(UsageReservation.CorrelationMaxLength).IsRequired();
        builder.HasOne<UsageMeter>().WithMany().HasForeignKey(r => r.MeterId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(r => r.MeterId);
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => new { r.Status, r.ExpiresAt });
    }
}

internal sealed class FeatureUsageConfiguration : IEntityTypeConfiguration<FeatureUsage>
{
    public void Configure(EntityTypeBuilder<FeatureUsage> builder)
    {
        builder.ToTable("feature_usage", t =>
        {
            t.HasCheckConstraint("ck_feature_usage_kind", CheckConstraints.In("kind", UsageKinds.All));
            t.HasCheckConstraint("ck_feature_usage_cost", "cost_usd_micros >= 0");
        });
        builder.Property(f => f.QuotaKey).HasMaxLength(QuotaKeys.MaxLength).IsRequired();
        builder.Property(f => f.Kind).HasMaxLength(16).IsRequired();
        builder.HasOne<UsageMeter>().WithMany().HasForeignKey(f => f.MeterId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<UsageReservation>().WithMany().HasForeignKey(f => f.ReservationId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(f => f.MeterId);
        builder.HasIndex(f => f.ReservationId);
        builder.HasIndex(f => new { f.UserId, f.OccurredAt });
    }
}

internal sealed class ReconciliationRunConfiguration : IEntityTypeConfiguration<ReconciliationRun>
{
    public const string ScheduledIndex = "ux_reconciliation_runs_scheduled_for";

    public void Configure(EntityTypeBuilder<ReconciliationRun> builder)
    {
        builder.ToTable("reconciliation_runs", t =>
        {
            t.HasCheckConstraint("ck_reconciliation_runs_status", CheckConstraints.In("status", RunStatuses.All));
            t.HasCheckConstraint("ck_reconciliation_runs_trigger", CheckConstraints.In("trigger", RunTriggers.All));
        });
        builder.Property(r => r.Status).HasMaxLength(16).IsRequired();
        builder.Property(r => r.Trigger).HasMaxLength(16).IsRequired();
        builder.HasIndex(r => r.ScheduledFor).IsUnique().HasFilter("scheduled_for IS NOT NULL").HasDatabaseName(ScheduledIndex);
        builder.HasIndex(r => r.CreatedAt);
    }
}

internal sealed class ReconciliationDriftConfiguration : IEntityTypeConfiguration<ReconciliationDrift>
{
    public void Configure(EntityTypeBuilder<ReconciliationDrift> builder)
    {
        builder.ToTable("reconciliation_drifts", t => t.HasCheckConstraint("ck_reconciliation_drifts_kind", CheckConstraints.In("kind", DriftKinds.All)));
        builder.Property(d => d.Kind).HasMaxLength(ReconciliationDrift.KindMaxLength).IsRequired();
        builder.Property(d => d.PaystackRef).HasMaxLength(ReconciliationDrift.RefMaxLength);
        builder.Property(d => d.Expected).HasMaxLength(ReconciliationDrift.ValueMaxLength);
        builder.Property(d => d.Actual).HasMaxLength(ReconciliationDrift.ValueMaxLength);
        builder.Property(d => d.Resolution).HasMaxLength(ReconciliationDrift.ValueMaxLength);
        builder.HasOne<ReconciliationRun>().WithMany().HasForeignKey(d => d.RunId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(d => d.RunId);
        builder.HasIndex(d => d.PaystackRef);
    }
}
