using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Notifications.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "notifications");

            migrationBuilder.CreateTable(
                name: "email_deliveries",
                schema: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    to_address_hash = table.Column<string>(type: "character(64)", fixedLength: true, maxLength: 64, nullable: false),
                    to_address_masked = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    template_key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    category = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    dedupe_key = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    provider_message_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    attempts = table.Column<short>(type: "smallint", nullable: false),
                    last_error_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status_changed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_email_deliveries", x => x.id);
                    table.CheckConstraint("ck_email_deliveries_attempts", "attempts >= 0");
                    table.CheckConstraint("ck_email_deliveries_category", "category IN ('security', 'account', 'internal')");
                    table.CheckConstraint("ck_email_deliveries_hash", "char_length(to_address_hash) = 64");
                    table.CheckConstraint("ck_email_deliveries_status", "status IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed')");
                });

            migrationBuilder.CreateIndex(
                name: "ix_email_deliveries_dedupe_key_template_key",
                schema: "notifications",
                table: "email_deliveries",
                columns: new[] { "dedupe_key", "template_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_email_deliveries_provider_message_id",
                schema: "notifications",
                table: "email_deliveries",
                column: "provider_message_id",
                unique: true,
                filter: "provider_message_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_email_deliveries_status_status_changed_at",
                schema: "notifications",
                table: "email_deliveries",
                columns: new[] { "status", "status_changed_at" });

            migrationBuilder.CreateIndex(
                name: "ix_email_deliveries_to_address_hash",
                schema: "notifications",
                table: "email_deliveries",
                column: "to_address_hash");

            migrationBuilder.CreateIndex(
                name: "ix_email_deliveries_user_id_created_at",
                schema: "notifications",
                table: "email_deliveries",
                columns: new[] { "user_id", "created_at" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "email_deliveries",
                schema: "notifications");
        }
    }
}
