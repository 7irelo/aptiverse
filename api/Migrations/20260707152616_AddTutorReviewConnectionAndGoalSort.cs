using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTutorReviewConnectionAndGoalSort : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "sort_order",
                schema: "goals",
                table: "goals",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "reviews",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_user_id = table.Column<string>(type: "text", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    student_name = table.Column<string>(type: "text", nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reviews", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tutor_connections",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_user_id = table.Column<string>(type: "text", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    student_name = table.Column<string>(type: "text", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    connected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_connections", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_reviews_student_id",
                schema: "marketplace",
                table: "reviews",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_tutor_user_id",
                schema: "marketplace",
                table: "reviews",
                column: "tutor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_connections_student_id",
                schema: "booking",
                table: "tutor_connections",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_connections_tutor_user_id",
                schema: "booking",
                table: "tutor_connections",
                column: "tutor_user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reviews",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "tutor_connections",
                schema: "booking");

            migrationBuilder.DropColumn(
                name: "sort_order",
                schema: "goals",
                table: "goals");
        }
    }
}
