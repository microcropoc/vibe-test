using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTest.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationRecipientUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecipientUserId",
                table: "TestApplications",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TestApplications_RecipientUserId",
                table: "TestApplications",
                column: "RecipientUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestApplications_Users_RecipientUserId",
                table: "TestApplications",
                column: "RecipientUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestApplications_Users_RecipientUserId",
                table: "TestApplications");

            migrationBuilder.DropIndex(
                name: "IX_TestApplications_RecipientUserId",
                table: "TestApplications");

            migrationBuilder.DropColumn(
                name: "RecipientUserId",
                table: "TestApplications");
        }
    }
}
