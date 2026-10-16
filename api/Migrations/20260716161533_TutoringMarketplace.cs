using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class TutoringMarketplace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "connects",
                schema: "marketplace",
                table: "tutors",
                type: "integer",
                nullable: false,
                // Existing tutors start with the standard starter balance.
                defaultValue: 20);

            migrationBuilder.AddColumn<DateTime>(
                name: "connects_refreshed_at",
                schema: "marketplace",
                table: "tutors",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "featured_rank",
                schema: "marketplace",
                table: "tutors",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "institution",
                schema: "marketplace",
                table: "tutors",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "matric_year",
                schema: "marketplace",
                table: "tutors",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "studying_toward",
                schema: "marketplace",
                table: "tutors",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "tutor_kind",
                schema: "marketplace",
                table: "tutors",
                type: "text",
                nullable: false,
                // Existing tutors read as current university students until they
                // say otherwise, rather than an empty kind.
                defaultValue: "university_student");

            migrationBuilder.AddColumn<string>(
                name: "initiated_by",
                schema: "booking",
                table: "tutor_connections",
                type: "text",
                nullable: false,
                // Every existing connection was a student reaching out directly.
                defaultValue: "student");

            migrationBuilder.CreateTable(
                name: "tutor_listings",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    learner_id = table.Column<string>(type: "text", nullable: false),
                    learner_name = table.Column<string>(type: "text", nullable: false),
                    posted_by_user_id = table.Column<string>(type: "text", nullable: false),
                    posted_by_role = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    level = table.Column<string>(type: "text", nullable: false),
                    details = table.Column<string>(type: "text", nullable: false),
                    mode = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_listings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tutor_proposals",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    listing_id = table.Column<long>(type: "bigint", nullable: false),
                    tutor_user_id = table.Column<string>(type: "text", nullable: false),
                    tutor_name = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    connects_spent = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_proposals", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_tutor_listings_learner_id",
                schema: "booking",
                table: "tutor_listings",
                column: "learner_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_listings_posted_by_user_id",
                schema: "booking",
                table: "tutor_listings",
                column: "posted_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_listings_status",
                schema: "booking",
                table: "tutor_listings",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_proposals_listing_id",
                schema: "booking",
                table: "tutor_proposals",
                column: "listing_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_proposals_listing_id_tutor_user_id",
                schema: "booking",
                table: "tutor_proposals",
                columns: new[] { "listing_id", "tutor_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_tutor_proposals_tutor_user_id",
                schema: "booking",
                table: "tutor_proposals",
                column: "tutor_user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tutor_listings",
                schema: "booking");

            migrationBuilder.DropTable(
                name: "tutor_proposals",
                schema: "booking");

            migrationBuilder.DropColumn(
                name: "connects",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "connects_refreshed_at",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "featured_rank",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "institution",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "matric_year",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "studying_toward",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "tutor_kind",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "initiated_by",
                schema: "booking",
                table: "tutor_connections");
        }
    }
}
