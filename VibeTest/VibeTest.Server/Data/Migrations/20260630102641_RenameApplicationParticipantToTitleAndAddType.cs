using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTest.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameApplicationParticipantToTitleAndAddType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ParticipantName",
                table: "TestApplications",
                newName: "Title");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "TestApplications",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(
                "UPDATE TestApplications SET Type = 1 WHERE RecipientUserId IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "TestApplications");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "TestApplications",
                newName: "ParticipantName");
        }
    }
}
