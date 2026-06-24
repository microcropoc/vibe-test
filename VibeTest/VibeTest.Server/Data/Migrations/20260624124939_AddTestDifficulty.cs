using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTest.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTestDifficulty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Difficulty",
                table: "Tests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "Tests");
        }
    }
}
