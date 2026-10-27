using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Billing.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "billing");

            migrationBuilder.CreateTable(
                name: "invoice_sequences",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    next_value = table.Column<int>(type: "integer", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoice_sequences", x => x.id);
                    table.CheckConstraint("ck_invoice_sequences_next", "next_value >= 1");
                });

            migrationBuilder.CreateTable(
                name: "paystack_events",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    dedupe_key = table.Column<string>(type: "character(64)", fixedLength: true, maxLength: 64, nullable: false),
                    event_type = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    object_ref = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    body_sha256 = table.Column<string>(type: "character(64)", fixedLength: true, maxLength: 64, nullable: false),
                    source = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    attempts = table.Column<int>(type: "integer", nullable: false),
                    received_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    processed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_error_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_paystack_events", x => x.id);
                    table.CheckConstraint("ck_paystack_events_source", "source IN ('webhook', 'reconciliation')");
                    table.CheckConstraint("ck_paystack_events_status", "status IN ('pending', 'processing', 'processed', 'ignored', 'failed')");
                });

            migrationBuilder.CreateTable(
                name: "plans",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    description = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    audience = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    max_seats = table.Column<int>(type: "integer", nullable: false),
                    is_public = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plans", x => x.id);
                    table.CheckConstraint("ck_plans_audience", "audience IN ('student', 'parent')");
                    table.CheckConstraint("ck_plans_kind", "kind IN ('free', 'paid', 'custom')");
                    table.CheckConstraint("ck_plans_max_seats", "max_seats BETWEEN 1 AND 10");
                });

            migrationBuilder.CreateTable(
                name: "reconciliation_runs",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    window_from = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    window_to = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    trigger = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    scheduled_for = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    checked_count = table.Column<int>(type: "integer", nullable: false),
                    drift_count = table.Column<int>(type: "integer", nullable: false),
                    finished_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reconciliation_runs", x => x.id);
                    table.CheckConstraint("ck_reconciliation_runs_status", "status IN ('running', 'succeeded', 'failed')");
                    table.CheckConstraint("ck_reconciliation_runs_trigger", "trigger IN ('scheduled', 'admin')");
                });

            migrationBuilder.CreateTable(
                name: "usage_meters",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_type = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quota_key = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    period_start = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    period_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    used = table.Column<int>(type: "integer", nullable: false),
                    reserved = table.Column<int>(type: "integer", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usage_meters", x => x.id);
                    table.CheckConstraint("ck_usage_meters_reserved", "reserved >= 0");
                    table.CheckConstraint("ck_usage_meters_subject_type", "subject_type IN ('user', 'subscription')");
                    table.CheckConstraint("ck_usage_meters_used", "used >= 0");
                });

            migrationBuilder.CreateTable(
                name: "plan_features",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    feature_key = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    label = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    is_live = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_plan_features_plans_plan_id",
                        column: x => x.plan_id,
                        principalSchema: "billing",
                        principalTable: "plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "plan_prices",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    interval = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    paystack_plan_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    paystack_synced_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_prices", x => x.id);
                    table.CheckConstraint("ck_plan_prices_amount", "amount_cents > 0");
                    table.CheckConstraint("ck_plan_prices_currency", "currency = 'ZAR'");
                    table.CheckConstraint("ck_plan_prices_interval", "interval IN ('monthly', 'annual')");
                    table.ForeignKey(
                        name: "fk_plan_prices_plans_plan_id",
                        column: x => x.plan_id,
                        principalSchema: "billing",
                        principalTable: "plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "plan_quotas",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quota_key = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    per_period = table.Column<int>(type: "integer", nullable: false),
                    pooled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_quotas", x => x.id);
                    table.CheckConstraint("ck_plan_quotas_per_period", "per_period >= -1");
                    table.CheckConstraint("ck_plan_quotas_quota_key", "quota_key IN ('ai.quick', 'ai.deep', 'ai.help', 'practice.generate', 'practice.essay_feedback')");
                    table.ForeignKey(
                        name: "fk_plan_quotas_plans_plan_id",
                        column: x => x.plan_id,
                        principalSchema: "billing",
                        principalTable: "plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reconciliation_drifts",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    run_id = table.Column<Guid>(type: "uuid", nullable: true),
                    kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    paystack_ref = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    local_id = table.Column<Guid>(type: "uuid", nullable: true),
                    expected = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    actual = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    resolved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    resolution = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reconciliation_drifts", x => x.id);
                    table.CheckConstraint("ck_reconciliation_drifts_kind", "kind IN ('missing_local_payment', 'missing_remote_payment', 'amount_mismatch', 'status_mismatch', 'subscription_status_mismatch', 'unprocessed_event', 'unmatched_charge', 'refund_exceeds_payment')");
                    table.ForeignKey(
                        name: "fk_reconciliation_drifts_reconciliation_runs_run_id",
                        column: x => x.run_id,
                        principalSchema: "billing",
                        principalTable: "reconciliation_runs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "usage_reservations",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    meter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quota_key = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    amount = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    confirmed_amount = table.Column<int>(type: "integer", nullable: true),
                    correlation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    resolved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usage_reservations", x => x.id);
                    table.CheckConstraint("ck_usage_reservations_amount", "amount > 0");
                    table.CheckConstraint("ck_usage_reservations_confirmed", "confirmed_amount IS NULL OR confirmed_amount >= 0");
                    table.CheckConstraint("ck_usage_reservations_status", "status IN ('reserved', 'confirmed', 'refunded', 'expired')");
                    table.ForeignKey(
                        name: "fk_usage_reservations_usage_meters_meter_id",
                        column: x => x.meter_id,
                        principalSchema: "billing",
                        principalTable: "usage_meters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "subscriptions",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    audience = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_price_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    interval = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    current_period_start = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    current_period_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    past_due_since = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    renewal_failure_count = table.Column<int>(type: "integer", nullable: false),
                    cancelled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cancel_reason = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    ended_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    paystack_subscription_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    paystack_customer_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscriptions", x => x.id);
                    table.CheckConstraint("ck_subscriptions_audience", "audience IN ('student', 'parent')");
                    table.CheckConstraint("ck_subscriptions_failures", "renewal_failure_count >= 0");
                    table.CheckConstraint("ck_subscriptions_interval", "interval IS NULL OR interval IN ('monthly', 'annual')");
                    table.CheckConstraint("ck_subscriptions_status", "status IN ('incomplete', 'trialing', 'active', 'past_due', 'cancelling', 'paused', 'cancelled', 'expired')");
                    table.ForeignKey(
                        name: "fk_subscriptions_plan_prices_plan_price_id",
                        column: x => x.plan_price_id,
                        principalSchema: "billing",
                        principalTable: "plan_prices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_subscriptions_plans_plan_id",
                        column: x => x.plan_id,
                        principalSchema: "billing",
                        principalTable: "plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "feature_usage",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    meter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reservation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quota_key = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    delta_used = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    cost_usd_micros = table.Column<long>(type: "bigint", nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_usage", x => x.id);
                    table.CheckConstraint("ck_feature_usage_cost", "cost_usd_micros >= 0");
                    table.CheckConstraint("ck_feature_usage_kind", "kind IN ('confirm', 'refund', 'expire', 'admin_adjust')");
                    table.ForeignKey(
                        name: "fk_feature_usage_usage_meters_meter_id",
                        column: x => x.meter_id,
                        principalSchema: "billing",
                        principalTable: "usage_meters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_feature_usage_usage_reservations_reservation_id",
                        column: x => x.reservation_id,
                        principalSchema: "billing",
                        principalTable: "usage_reservations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "checkout_sessions",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purpose = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    plan_price_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reference = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    access_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    authorization_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_checkout_sessions", x => x.id);
                    table.CheckConstraint("ck_checkout_sessions_amount", "amount_cents > 0");
                    table.CheckConstraint("ck_checkout_sessions_currency", "currency = 'ZAR'");
                    table.CheckConstraint("ck_checkout_sessions_purpose", "purpose IN ('subscription', 'upgrade', 'one_off')");
                    table.CheckConstraint("ck_checkout_sessions_status", "status IN ('open', 'paid', 'abandoned', 'failed')");
                    table.ForeignKey(
                        name: "fk_checkout_sessions_plan_prices_plan_price_id",
                        column: x => x.plan_price_id,
                        principalSchema: "billing",
                        principalTable: "plan_prices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_checkout_sessions_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "billing",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    is_tax_invoice = table.Column<bool>(type: "boolean", nullable: false),
                    period_start = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    period_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    subtotal_cents = table.Column<long>(type: "bigint", nullable: false),
                    vat_cents = table.Column<long>(type: "bigint", nullable: false),
                    total_cents = table.Column<long>(type: "bigint", nullable: false),
                    vat_rate_bps = table.Column<int>(type: "integer", nullable: false),
                    currency = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    billing_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    billing_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    issued_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoices", x => x.id);
                    table.CheckConstraint("ck_invoices_currency", "currency = 'ZAR'");
                    table.CheckConstraint("ck_invoices_status", "status IN ('paid', 'refunded', 'partially_refunded', 'void')");
                    table.CheckConstraint("ck_invoices_tax_invoice", "is_tax_invoice OR (vat_cents = 0 AND vat_rate_bps = 0)");
                    table.CheckConstraint("ck_invoices_total", "total_cents = subtotal_cents + vat_cents");
                    table.CheckConstraint("ck_invoices_vat", "vat_cents >= 0");
                    table.ForeignKey(
                        name: "fk_invoices_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "billing",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "subscription_transitions",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    to_status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    transition = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    trigger_type = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    trigger_ref = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_transitions", x => x.id);
                    table.CheckConstraint("ck_subscription_transitions_trigger_type", "trigger_type IN ('webhook', 'user', 'scheduler', 'admin', 'reconciliation')");
                    table.ForeignKey(
                        name: "fk_subscription_transitions_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "billing",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoice_lines",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoice_lines", x => x.id);
                    table.CheckConstraint("ck_invoice_lines_amount", "amount_cents = quantity * unit_amount_cents");
                    table.CheckConstraint("ck_invoice_lines_quantity", "quantity > 0");
                    table.ForeignKey(
                        name: "fk_invoice_lines_invoices_invoice_id",
                        column: x => x.invoice_id,
                        principalSchema: "billing",
                        principalTable: "invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: true),
                    checkout_session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    paystack_reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    paystack_transaction_id = table.Column<long>(type: "bigint", nullable: false),
                    amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    fees_cents = table.Column<long>(type: "bigint", nullable: true),
                    currency = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    channel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    purpose = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    paid_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.id);
                    table.CheckConstraint("ck_payments_amount", "amount_cents > 0");
                    table.CheckConstraint("ck_payments_currency", "currency = 'ZAR'");
                    table.CheckConstraint("ck_payments_fees", "fees_cents IS NULL OR fees_cents >= 0");
                    table.CheckConstraint("ck_payments_purpose", "purpose IN ('subscription', 'renewal', 'upgrade', 'one_off')");
                    table.CheckConstraint("ck_payments_status", "status IN ('succeeded', 'failed', 'reversed')");
                    table.ForeignKey(
                        name: "fk_payments_checkout_sessions_checkout_session_id",
                        column: x => x.checkout_session_id,
                        principalSchema: "billing",
                        principalTable: "checkout_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_payments_invoices_invoice_id",
                        column: x => x.invoice_id,
                        principalSchema: "billing",
                        principalTable: "invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_payments_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "billing",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "refunds",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    payment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    paystack_refund_id = table.Column<long>(type: "bigint", nullable: true),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    processed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refunds", x => x.id);
                    table.CheckConstraint("ck_refunds_amount", "amount_cents > 0");
                    table.CheckConstraint("ck_refunds_currency", "currency = 'ZAR'");
                    table.CheckConstraint("ck_refunds_status", "status IN ('pending', 'processed', 'failed')");
                    table.ForeignKey(
                        name: "fk_refunds_payments_payment_id",
                        column: x => x.payment_id,
                        principalSchema: "billing",
                        principalTable: "payments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ledger_entries",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    amount_cents = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: false),
                    payment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    refund_id = table.Column<Guid>(type: "uuid", nullable: true),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ledger_entries", x => x.id);
                    table.CheckConstraint("ck_ledger_entries_currency", "currency = 'ZAR'");
                    table.CheckConstraint("ck_ledger_entries_kind", "kind IN ('charge', 'refund', 'credit')");
                    table.CheckConstraint("ck_ledger_entries_sign", "(kind = 'charge' AND amount_cents > 0) OR (kind <> 'charge' AND amount_cents < 0)");
                    table.ForeignKey(
                        name: "fk_ledger_entries_invoices_invoice_id",
                        column: x => x.invoice_id,
                        principalSchema: "billing",
                        principalTable: "invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_ledger_entries_payments_payment_id",
                        column: x => x.payment_id,
                        principalSchema: "billing",
                        principalTable: "payments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_ledger_entries_refunds_refund_id",
                        column: x => x.refund_id,
                        principalSchema: "billing",
                        principalTable: "refunds",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_ledger_entries_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "billing",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_checkout_sessions_plan_price_id",
                schema: "billing",
                table: "checkout_sessions",
                column: "plan_price_id");

            migrationBuilder.CreateIndex(
                name: "ix_checkout_sessions_reference",
                schema: "billing",
                table: "checkout_sessions",
                column: "reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_checkout_sessions_subscription_id",
                schema: "billing",
                table: "checkout_sessions",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_checkout_sessions_user_id_idempotency_key",
                schema: "billing",
                table: "checkout_sessions",
                columns: new[] { "user_id", "idempotency_key" },
                unique: true,
                filter: "idempotency_key IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_checkout_sessions_user_id_status",
                schema: "billing",
                table: "checkout_sessions",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_feature_usage_meter_id",
                schema: "billing",
                table: "feature_usage",
                column: "meter_id");

            migrationBuilder.CreateIndex(
                name: "ix_feature_usage_reservation_id",
                schema: "billing",
                table: "feature_usage",
                column: "reservation_id");

            migrationBuilder.CreateIndex(
                name: "ix_feature_usage_user_id_occurred_at",
                schema: "billing",
                table: "feature_usage",
                columns: new[] { "user_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_invoice_lines_invoice_id",
                schema: "billing",
                table: "invoice_lines",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoice_sequences_year",
                schema: "billing",
                table: "invoice_sequences",
                column: "year",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_invoices_number",
                schema: "billing",
                table: "invoices",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_invoices_subscription_id",
                schema: "billing",
                table: "invoices",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_user_id_issued_at",
                schema: "billing",
                table: "invoices",
                columns: new[] { "user_id", "issued_at" });

            migrationBuilder.CreateIndex(
                name: "ix_ledger_entries_invoice_id",
                schema: "billing",
                table: "ledger_entries",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_ledger_entries_payment_id",
                schema: "billing",
                table: "ledger_entries",
                column: "payment_id");

            migrationBuilder.CreateIndex(
                name: "ix_ledger_entries_refund_id",
                schema: "billing",
                table: "ledger_entries",
                column: "refund_id",
                unique: true,
                filter: "refund_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_ledger_entries_subscription_id",
                schema: "billing",
                table: "ledger_entries",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_ledger_entries_user_id_occurred_at",
                schema: "billing",
                table: "ledger_entries",
                columns: new[] { "user_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ux_ledger_entries_one_charge_per_payment",
                schema: "billing",
                table: "ledger_entries",
                columns: new[] { "payment_id", "kind" },
                unique: true,
                filter: "kind = 'charge'");

            migrationBuilder.CreateIndex(
                name: "ix_payments_checkout_session_id",
                schema: "billing",
                table: "payments",
                column: "checkout_session_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_invoice_id",
                schema: "billing",
                table: "payments",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_paystack_reference",
                schema: "billing",
                table: "payments",
                column: "paystack_reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_payments_paystack_transaction_id",
                schema: "billing",
                table: "payments",
                column: "paystack_transaction_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_payments_subscription_id",
                schema: "billing",
                table: "payments",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_user_id_paid_at",
                schema: "billing",
                table: "payments",
                columns: new[] { "user_id", "paid_at" });

            migrationBuilder.CreateIndex(
                name: "ix_paystack_events_dedupe_key",
                schema: "billing",
                table: "paystack_events",
                column: "dedupe_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_paystack_events_event_type",
                schema: "billing",
                table: "paystack_events",
                column: "event_type");

            migrationBuilder.CreateIndex(
                name: "ix_paystack_events_object_ref",
                schema: "billing",
                table: "paystack_events",
                column: "object_ref");

            migrationBuilder.CreateIndex(
                name: "ix_paystack_events_status_received_at",
                schema: "billing",
                table: "paystack_events",
                columns: new[] { "status", "received_at" });

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_feature_key",
                schema: "billing",
                table: "plan_features",
                column: "feature_key");

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_plan_id_feature_key",
                schema: "billing",
                table: "plan_features",
                columns: new[] { "plan_id", "feature_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_plan_prices_paystack_plan_code",
                schema: "billing",
                table: "plan_prices",
                column: "paystack_plan_code",
                unique: true,
                filter: "paystack_plan_code IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_plan_prices_plan_id_interval",
                schema: "billing",
                table: "plan_prices",
                columns: new[] { "plan_id", "interval" },
                unique: true,
                filter: "is_active AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_plan_quotas_plan_id_quota_key",
                schema: "billing",
                table: "plan_quotas",
                columns: new[] { "plan_id", "quota_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_plans_code",
                schema: "billing",
                table: "plans",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_reconciliation_drifts_paystack_ref",
                schema: "billing",
                table: "reconciliation_drifts",
                column: "paystack_ref");

            migrationBuilder.CreateIndex(
                name: "ix_reconciliation_drifts_run_id",
                schema: "billing",
                table: "reconciliation_drifts",
                column: "run_id");

            migrationBuilder.CreateIndex(
                name: "ix_reconciliation_runs_created_at",
                schema: "billing",
                table: "reconciliation_runs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ux_reconciliation_runs_scheduled_for",
                schema: "billing",
                table: "reconciliation_runs",
                column: "scheduled_for",
                unique: true,
                filter: "scheduled_for IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_refunds_payment_id",
                schema: "billing",
                table: "refunds",
                column: "payment_id");

            migrationBuilder.CreateIndex(
                name: "ix_refunds_paystack_refund_id",
                schema: "billing",
                table: "refunds",
                column: "paystack_refund_id",
                unique: true,
                filter: "paystack_refund_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_transitions_subscription_id_occurred_at",
                schema: "billing",
                table: "subscription_transitions",
                columns: new[] { "subscription_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_current_period_end",
                schema: "billing",
                table: "subscriptions",
                column: "current_period_end");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_owner_user_id",
                schema: "billing",
                table: "subscriptions",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_paystack_customer_code",
                schema: "billing",
                table: "subscriptions",
                column: "paystack_customer_code");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_paystack_subscription_code",
                schema: "billing",
                table: "subscriptions",
                column: "paystack_subscription_code",
                unique: true,
                filter: "paystack_subscription_code IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_plan_id",
                schema: "billing",
                table: "subscriptions",
                column: "plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_plan_price_id",
                schema: "billing",
                table: "subscriptions",
                column: "plan_price_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_status",
                schema: "billing",
                table: "subscriptions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ux_subscriptions_owner_audience_holding",
                schema: "billing",
                table: "subscriptions",
                columns: new[] { "owner_user_id", "audience" },
                unique: true,
                filter: "status IN ('trialing', 'active', 'past_due', 'cancelling') AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ux_usage_meters_subject_period",
                schema: "billing",
                table: "usage_meters",
                columns: new[] { "subject_type", "subject_id", "quota_key", "period_start" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usage_reservations_meter_id",
                schema: "billing",
                table: "usage_reservations",
                column: "meter_id");

            migrationBuilder.CreateIndex(
                name: "ix_usage_reservations_status_expires_at",
                schema: "billing",
                table: "usage_reservations",
                columns: new[] { "status", "expires_at" });

            migrationBuilder.CreateIndex(
                name: "ix_usage_reservations_user_id",
                schema: "billing",
                table: "usage_reservations",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "feature_usage",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "invoice_lines",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "invoice_sequences",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "ledger_entries",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "paystack_events",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "plan_features",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "plan_quotas",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "reconciliation_drifts",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "subscription_transitions",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "usage_reservations",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "refunds",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "reconciliation_runs",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "usage_meters",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "payments",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "checkout_sessions",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "invoices",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "subscriptions",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "plan_prices",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "plans",
                schema: "billing");
        }
    }
}
