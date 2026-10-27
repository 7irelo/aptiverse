using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Family.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "family");

            migrationBuilder.CreateTable(
                name: "invites",
                schema: "family",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    inviter_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    invitee_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    inviter_display_name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    relationship = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    token_hash = table.Column<string>(type: "character(64)", fixedLength: true, maxLength: 64, nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    accepted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    responded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invites", x => x.id);
                    table.CheckConstraint("ck_invites_email_lower", "invitee_email = lower(invitee_email)");
                    table.CheckConstraint("ck_invites_relationship", "relationship IN ('mother', 'father', 'guardian', 'other')");
                    table.CheckConstraint("ck_invites_status", "status IN ('pending', 'accepted', 'cancelled', 'expired')");
                    table.CheckConstraint("ck_invites_token_hash", "char_length(token_hash) = 64");
                });

            migrationBuilder.CreateTable(
                name: "link_code_failures",
                schema: "family",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_link_code_failures", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "link_codes",
                schema: "family",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    selector = table.Column<string>(type: "character(4)", fixedLength: true, maxLength: 4, nullable: false),
                    code_hash = table.Column<string>(type: "character(64)", fixedLength: true, maxLength: 64, nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    failed_attempts = table.Column<int>(type: "integer", nullable: false),
                    used_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    used_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_link_codes", x => x.id);
                    table.CheckConstraint("ck_link_codes_failed_attempts", "failed_attempts >= 0");
                    table.CheckConstraint("ck_link_codes_hash", "char_length(code_hash) = 64");
                    table.CheckConstraint("ck_link_codes_selector", "char_length(selector) = 4");
                    table.CheckConstraint("ck_link_codes_status", "status IN ('active', 'used', 'replaced', 'burned')");
                });

            migrationBuilder.CreateTable(
                name: "links",
                schema: "family",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    relationship = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    method = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    source_id = table.Column<Guid>(type: "uuid", nullable: false),
                    share_academics = table.Column<bool>(type: "boolean", nullable: false),
                    share_practice = table.Column<bool>(type: "boolean", nullable: false),
                    share_goals = table.Column<bool>(type: "boolean", nullable: false),
                    share_tutor_activity = table.Column<bool>(type: "boolean", nullable: false),
                    linked_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    sharing_changed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    removed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    removed_by_role = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_links", x => x.id);
                    table.CheckConstraint("ck_links_method", "method IN ('invite', 'link_code')");
                    table.CheckConstraint("ck_links_not_self", "parent_user_id <> student_user_id");
                    table.CheckConstraint("ck_links_relationship", "relationship IN ('mother', 'father', 'guardian', 'other')");
                    table.CheckConstraint("ck_links_removed", "(status = 'removed') = (removed_at IS NOT NULL)");
                    table.CheckConstraint("ck_links_removed_by", "removed_by_role IS NULL OR removed_by_role IN ('parent', 'student', 'system')");
                    table.CheckConstraint("ck_links_status", "status IN ('active', 'removed')");
                });

            migrationBuilder.CreateTable(
                name: "parental_consents",
                schema: "family",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    source = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    document_version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parental_consents", x => x.id);
                    table.CheckConstraint("ck_parental_consents_action", "action IN ('granted', 'withdrawn')");
                    table.CheckConstraint("ck_parental_consents_source", "source IN ('parent', 'system')");
                });

            migrationBuilder.CreateIndex(
                name: "ix_invites_invitee_email_status",
                schema: "family",
                table: "invites",
                columns: new[] { "invitee_email", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_invites_inviter_user_id_status",
                schema: "family",
                table: "invites",
                columns: new[] { "inviter_user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_invites_token_hash",
                schema: "family",
                table: "invites",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_invites_pending",
                schema: "family",
                table: "invites",
                columns: new[] { "inviter_user_id", "invitee_email" },
                unique: true,
                filter: "status = 'pending' AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_link_code_failures_parent_user_id_occurred_at",
                schema: "family",
                table: "link_code_failures",
                columns: new[] { "parent_user_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_link_codes_selector_status",
                schema: "family",
                table: "link_codes",
                columns: new[] { "selector", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_link_codes_active_student",
                schema: "family",
                table: "link_codes",
                column: "student_user_id",
                unique: true,
                filter: "status = 'active' AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_links_parent_user_id_status",
                schema: "family",
                table: "links",
                columns: new[] { "parent_user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_links_student_user_id_status",
                schema: "family",
                table: "links",
                columns: new[] { "student_user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_links_active_pair",
                schema: "family",
                table: "links",
                columns: new[] { "parent_user_id", "student_user_id" },
                unique: true,
                filter: "status = 'active' AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_parental_consents_parent_user_id",
                schema: "family",
                table: "parental_consents",
                column: "parent_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_parental_consents_student_user_id_occurred_at",
                schema: "family",
                table: "parental_consents",
                columns: new[] { "student_user_id", "occurred_at" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "invites",
                schema: "family");

            migrationBuilder.DropTable(
                name: "link_code_failures",
                schema: "family");

            migrationBuilder.DropTable(
                name: "link_codes",
                schema: "family");

            migrationBuilder.DropTable(
                name: "links",
                schema: "family");

            migrationBuilder.DropTable(
                name: "parental_consents",
                schema: "family");
        }
    }
}
