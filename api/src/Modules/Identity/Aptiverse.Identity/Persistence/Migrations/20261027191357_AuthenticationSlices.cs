using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Identity.Persistence.Migrations
{
    /// <summary>
    /// Additive: age, study level and programme on users, consent withdrawal, and the deletion request lifecycle
    /// (cooling-off schedule, one pending request per user). Rollback is the generated Down; it drops only the new
    /// columns and restores the previous check constraints.
    /// </summary>
    internal partial class AuthenticationSlices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_security_events_type",
                schema: "identity",
                table: "security_events");

            migrationBuilder.AddColumn<DateOnly>(
                name: "date_of_birth",
                schema: "identity",
                table: "users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "programme",
                schema: "identity",
                table: "users",
                type: "character varying(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "study_level",
                schema: "identity",
                table: "users",
                type: "character varying(24)",
                maxLength: 24,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "withdrawn_at",
                schema: "identity",
                table: "user_consents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "cancelled_at",
                schema: "identity",
                table: "account_deletion_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "decided_at",
                schema: "identity",
                table: "account_deletion_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "requested_at",
                schema: "identity",
                table: "account_deletion_requests",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            // Rows written before this migration were requested when they were created.
            migrationBuilder.Sql("UPDATE identity.account_deletion_requests SET requested_at = created_at;");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "scheduled_erasure_at",
                schema: "identity",
                table: "account_deletion_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_users_date_of_birth",
                schema: "identity",
                table: "users",
                sql: "date_of_birth IS NULL OR date_of_birth BETWEEN '1900-01-01' AND '2100-01-01'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_users_stage_shape",
                schema: "identity",
                table: "users",
                sql: "education_level IS NULL OR (education_level = 'high_school' AND year_of_study IS NULL AND study_level IS NULL AND programme IS NULL) OR (education_level = 'tertiary' AND grade IS NULL AND curriculum IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_users_study_level",
                schema: "identity",
                table: "users",
                sql: "study_level IS NULL OR study_level IN ('first_year', 'second_year', 'third_year', 'fourth_year', 'honours', 'masters', 'phd')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_users_year_matches_level",
                schema: "identity",
                table: "users",
                sql: "year_of_study IS NULL OR study_level IN ('first_year', 'second_year', 'third_year', 'fourth_year')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_user_consents_document_key",
                schema: "identity",
                table: "user_consents",
                sql: "document_key IN ('terms', 'privacy', 'marketing_email', 'adult_confirmation')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_user_consents_source",
                schema: "identity",
                table: "user_consents",
                sql: "source IN ('register', 'google', 'reconsent', 'migration', 'onboarding', 'profile')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_security_events_type",
                schema: "identity",
                table: "security_events",
                sql: "type IN ('registered', 'login_succeeded', 'login_failed', 'lockout', 'logout', 'session_revoked', 'refresh_reuse_detected', 'email_verified', 'password_changed', 'password_reset_requested', 'password_reset', 'google_linked', 'account_deletion_requested', 'account_deletion_cancelled', 'date_of_birth_set', 'adult_confirmed')");

            migrationBuilder.CreateIndex(
                name: "ix_account_deletion_requests_user_id_pending",
                schema: "identity",
                table: "account_deletion_requests",
                column: "user_id",
                unique: true,
                filter: "status = 'pending' AND deleted_at IS NULL");

            migrationBuilder.AddCheckConstraint(
                name: "ck_account_deletion_requests_status",
                schema: "identity",
                table: "account_deletion_requests",
                sql: "status IN ('pending', 'approved', 'completed', 'cancelled')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_users_date_of_birth",
                schema: "identity",
                table: "users");

            migrationBuilder.DropCheckConstraint(
                name: "ck_users_stage_shape",
                schema: "identity",
                table: "users");

            migrationBuilder.DropCheckConstraint(
                name: "ck_users_study_level",
                schema: "identity",
                table: "users");

            migrationBuilder.DropCheckConstraint(
                name: "ck_users_year_matches_level",
                schema: "identity",
                table: "users");

            migrationBuilder.DropCheckConstraint(
                name: "ck_user_consents_document_key",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.DropCheckConstraint(
                name: "ck_user_consents_source",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.DropCheckConstraint(
                name: "ck_security_events_type",
                schema: "identity",
                table: "security_events");

            migrationBuilder.DropIndex(
                name: "ix_account_deletion_requests_user_id_pending",
                schema: "identity",
                table: "account_deletion_requests");

            migrationBuilder.DropCheckConstraint(
                name: "ck_account_deletion_requests_status",
                schema: "identity",
                table: "account_deletion_requests");

            migrationBuilder.DropColumn(
                name: "date_of_birth",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "programme",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "study_level",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "withdrawn_at",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.DropColumn(
                name: "cancelled_at",
                schema: "identity",
                table: "account_deletion_requests");

            migrationBuilder.DropColumn(
                name: "decided_at",
                schema: "identity",
                table: "account_deletion_requests");

            migrationBuilder.DropColumn(
                name: "requested_at",
                schema: "identity",
                table: "account_deletion_requests");

            migrationBuilder.DropColumn(
                name: "scheduled_erasure_at",
                schema: "identity",
                table: "account_deletion_requests");

            migrationBuilder.AddCheckConstraint(
                name: "ck_security_events_type",
                schema: "identity",
                table: "security_events",
                sql: "type IN ('registered', 'login_succeeded', 'login_failed', 'lockout', 'logout', 'session_revoked', 'refresh_reuse_detected', 'email_verified', 'password_changed', 'password_reset_requested', 'password_reset', 'google_linked', 'account_deletion_requested')");
        }
    }
}
