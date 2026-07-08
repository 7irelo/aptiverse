using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSelfServeRecurringBilling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "billing",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "billing_email",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "card_brand",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "card_exp_month",
                schema: "entitlements",
                table: "subscriptions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "card_exp_year",
                schema: "entitlements",
                table: "subscriptions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "card_last4",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_charge_at",
                schema: "entitlements",
                table: "subscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "paystack_customer_id",
                schema: "entitlements",
                table: "subscriptions",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "renewal_failure_count",
                schema: "entitlements",
                table: "subscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "billing",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "billing_email",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "card_brand",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "card_exp_month",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "card_exp_year",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "card_last4",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "last_charge_at",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "paystack_customer_id",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "renewal_failure_count",
                schema: "entitlements",
                table: "subscriptions");
        }
    }
}
