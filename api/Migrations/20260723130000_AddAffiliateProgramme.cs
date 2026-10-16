using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAffiliateProgramme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "affiliates");

            migrationBuilder.CreateTable(
                name: "affiliates",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    referral_code = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    audience = table.Column<string>(type: "text", nullable: false),
                    payout_onboarding_status = table.Column<string>(type: "text", nullable: false),
                    legal_first_name = table.Column<string>(type: "text", nullable: true),
                    legal_last_name = table.Column<string>(type: "text", nullable: true),
                    id_type = table.Column<string>(type: "text", nullable: true),
                    id_number = table.Column<string>(type: "text", nullable: true),
                    tax_reference_number = table.Column<string>(type: "text", nullable: true),
                    address_line1 = table.Column<string>(type: "text", nullable: true),
                    address_line2 = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: true),
                    province = table.Column<string>(type: "text", nullable: true),
                    postal_code = table.Column<string>(type: "text", nullable: true),
                    country = table.Column<string>(type: "text", nullable: true),
                    bank_name = table.Column<string>(type: "text", nullable: true),
                    account_holder_name = table.Column<string>(type: "text", nullable: true),
                    account_number = table.Column<string>(type: "text", nullable: true),
                    branch_code = table.Column<string>(type: "text", nullable: true),
                    account_type = table.Column<string>(type: "text", nullable: true),
                    contact_email = table.Column<string>(type: "text", nullable: true),
                    contact_phone = table.Column<string>(type: "text", nullable: true),
                    details_submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_by_user_id = table.Column<string>(type: "text", nullable: true),
                    review_notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_affiliates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "commission_entry_events",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    commission_entry_id = table.Column<long>(type: "bigint", nullable: false),
                    from_status = table.Column<string>(type: "text", nullable: true),
                    to_status = table.Column<string>(type: "text", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    actor_user_id = table.Column<string>(type: "text", nullable: false),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_commission_entry_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "device_fingerprints",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    device_hash = table.Column<string>(type: "text", nullable: false),
                    first_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_device_fingerprints", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "payment_fingerprints",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    fingerprint_hash = table.Column<string>(type: "text", nullable: false),
                    card_brand = table.Column<string>(type: "text", nullable: true),
                    card_last4 = table.Column<string>(type: "text", nullable: true),
                    first_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payment_fingerprints", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "referral_fraud_signals",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    affiliate_id = table.Column<long>(type: "bigint", nullable: false),
                    referral_id = table.Column<long>(type: "bigint", nullable: true),
                    signal_type = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    detail = table.Column<string>(type: "text", nullable: true),
                    subject_user_id = table.Column<string>(type: "text", nullable: true),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_referral_fraud_signals", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "affiliate_payouts",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    affiliate_id = table.Column<long>(type: "bigint", nullable: false),
                    run_reference = table.Column<string>(type: "text", nullable: false),
                    period_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    period_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_zar = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    entry_count = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    payment_reference = table.Column<string>(type: "text", nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    paid_by_user_id = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    payee_name = table.Column<string>(type: "text", nullable: true),
                    payee_id_type = table.Column<string>(type: "text", nullable: true),
                    payee_id_number = table.Column<string>(type: "text", nullable: true),
                    payee_tax_reference_number = table.Column<string>(type: "text", nullable: true),
                    bank_name = table.Column<string>(type: "text", nullable: true),
                    account_holder_name = table.Column<string>(type: "text", nullable: true),
                    account_number = table.Column<string>(type: "text", nullable: true),
                    branch_code = table.Column<string>(type: "text", nullable: true),
                    account_type = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_affiliate_payouts", x => x.id);
                    table.ForeignKey(
                        name: "fk_affiliate_payouts_affiliates_affiliate_id",
                        column: x => x.affiliate_id,
                        principalSchema: "affiliates",
                        principalTable: "affiliates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "referrals",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    affiliate_id = table.Column<long>(type: "bigint", nullable: false),
                    referred_user_id = table.Column<string>(type: "text", nullable: false),
                    code_used = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    signed_up_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    first_payment_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    landing_path = table.Column<string>(type: "text", nullable: true),
                    flag_reason = table.Column<string>(type: "text", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_by_user_id = table.Column<string>(type: "text", nullable: true),
                    review_notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_referrals", x => x.id);
                    table.ForeignKey(
                        name: "fk_referrals_affiliates_affiliate_id",
                        column: x => x.affiliate_id,
                        principalSchema: "affiliates",
                        principalTable: "affiliates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "affiliate_payout_items",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    payout_id = table.Column<long>(type: "bigint", nullable: false),
                    commission_entry_id = table.Column<long>(type: "bigint", nullable: false),
                    amount_zar = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_affiliate_payout_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_affiliate_payout_items_affiliate_payouts_payout_id",
                        column: x => x.payout_id,
                        principalSchema: "affiliates",
                        principalTable: "affiliate_payouts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "commission_entries",
                schema: "affiliates",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    affiliate_id = table.Column<long>(type: "bigint", nullable: false),
                    referral_id = table.Column<long>(type: "bigint", nullable: false),
                    entry_type = table.Column<string>(type: "text", nullable: false),
                    payment_number = table.Column<int>(type: "integer", nullable: false),
                    source_payment_reference = table.Column<string>(type: "text", nullable: false),
                    source_subscription_id = table.Column<long>(type: "bigint", nullable: true),
                    source_plan_code = table.Column<string>(type: "text", nullable: true),
                    source_payment_amount_zar = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    commission_rate = table.Column<decimal>(type: "numeric(6,4)", precision: 6, scale: 4, nullable: false),
                    amount_zar = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    hold_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    became_payable_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payout_id = table.Column<long>(type: "bigint", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    reverses_entry_id = table.Column<long>(type: "bigint", nullable: true),
                    created_by_user_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_commission_entries", x => x.id);
                    table.ForeignKey(
                        name: "fk_commission_entries_referral_referral_id",
                        column: x => x.referral_id,
                        principalSchema: "affiliates",
                        principalTable: "referrals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_affiliate_payout_items_commission_entry_id",
                schema: "affiliates",
                table: "affiliate_payout_items",
                column: "commission_entry_id");

            migrationBuilder.CreateIndex(
                name: "ix_affiliate_payout_items_payout_id",
                schema: "affiliates",
                table: "affiliate_payout_items",
                column: "payout_id");

            migrationBuilder.CreateIndex(
                name: "ix_affiliate_payouts_affiliate_id",
                schema: "affiliates",
                table: "affiliate_payouts",
                column: "affiliate_id");

            migrationBuilder.CreateIndex(
                name: "ix_affiliate_payouts_paid_at",
                schema: "affiliates",
                table: "affiliate_payouts",
                column: "paid_at");

            migrationBuilder.CreateIndex(
                name: "ix_affiliate_payouts_run_reference",
                schema: "affiliates",
                table: "affiliate_payouts",
                column: "run_reference");

            migrationBuilder.CreateIndex(
                name: "ix_affiliate_payouts_status",
                schema: "affiliates",
                table: "affiliate_payouts",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_affiliates_payout_onboarding_status",
                schema: "affiliates",
                table: "affiliates",
                column: "payout_onboarding_status");

            migrationBuilder.CreateIndex(
                name: "ix_affiliates_referral_code",
                schema: "affiliates",
                table: "affiliates",
                column: "referral_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_affiliates_user_id",
                schema: "affiliates",
                table: "affiliates",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_commission_entries_affiliate_id",
                schema: "affiliates",
                table: "commission_entries",
                column: "affiliate_id");

            migrationBuilder.CreateIndex(
                name: "ix_commission_entries_occurred_at",
                schema: "affiliates",
                table: "commission_entries",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "ix_commission_entries_referral_id",
                schema: "affiliates",
                table: "commission_entries",
                column: "referral_id");

            migrationBuilder.CreateIndex(
                name: "ix_commission_entries_referral_id_source_payment_reference_ent",
                schema: "affiliates",
                table: "commission_entries",
                columns: new[] { "referral_id", "source_payment_reference", "entry_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_commission_entries_source_payment_reference",
                schema: "affiliates",
                table: "commission_entries",
                column: "source_payment_reference");

            migrationBuilder.CreateIndex(
                name: "ix_commission_entries_status",
                schema: "affiliates",
                table: "commission_entries",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_commission_entry_events_commission_entry_id",
                schema: "affiliates",
                table: "commission_entry_events",
                column: "commission_entry_id");

            migrationBuilder.CreateIndex(
                name: "ix_commission_entry_events_occurred_at",
                schema: "affiliates",
                table: "commission_entry_events",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "ix_device_fingerprints_device_hash",
                schema: "affiliates",
                table: "device_fingerprints",
                column: "device_hash");

            migrationBuilder.CreateIndex(
                name: "ix_device_fingerprints_user_id",
                schema: "affiliates",
                table: "device_fingerprints",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_payment_fingerprints_fingerprint_hash",
                schema: "affiliates",
                table: "payment_fingerprints",
                column: "fingerprint_hash");

            migrationBuilder.CreateIndex(
                name: "ix_payment_fingerprints_user_id",
                schema: "affiliates",
                table: "payment_fingerprints",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_referral_fraud_signals_affiliate_id",
                schema: "affiliates",
                table: "referral_fraud_signals",
                column: "affiliate_id");

            migrationBuilder.CreateIndex(
                name: "ix_referral_fraud_signals_referral_id",
                schema: "affiliates",
                table: "referral_fraud_signals",
                column: "referral_id");

            migrationBuilder.CreateIndex(
                name: "ix_referral_fraud_signals_signal_type",
                schema: "affiliates",
                table: "referral_fraud_signals",
                column: "signal_type");

            migrationBuilder.CreateIndex(
                name: "ix_referrals_affiliate_id",
                schema: "affiliates",
                table: "referrals",
                column: "affiliate_id");

            migrationBuilder.CreateIndex(
                name: "ix_referrals_referred_user_id",
                schema: "affiliates",
                table: "referrals",
                column: "referred_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_referrals_status",
                schema: "affiliates",
                table: "referrals",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "affiliate_payout_items",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "commission_entries",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "commission_entry_events",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "device_fingerprints",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "payment_fingerprints",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "referral_fraud_signals",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "affiliate_payouts",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "referrals",
                schema: "affiliates");

            migrationBuilder.DropTable(
                name: "affiliates",
                schema: "affiliates");
        }
    }
}
