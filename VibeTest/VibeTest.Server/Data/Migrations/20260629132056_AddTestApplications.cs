using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTest.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTestApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TestApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Token = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuthorId = table.Column<int>(type: "INTEGER", nullable: false),
                    TestId = table.Column<int>(type: "INTEGER", nullable: false),
                    ParticipantName = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestApplications_Tests_TestId",
                        column: x => x.TestId,
                        principalTable: "Tests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TestApplications_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ApplicationId = table.Column<int>(type: "INTEGER", nullable: false),
                    QuestionId = table.Column<int>(type: "INTEGER", nullable: false),
                    AnswerId = table.Column<int>(type: "INTEGER", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationResults_Answers_AnswerId",
                        column: x => x.AnswerId,
                        principalTable: "Answers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicationResults_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicationResults_TestApplications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "TestApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationResults_AnswerId",
                table: "ApplicationResults",
                column: "AnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationResults_ApplicationId_QuestionId",
                table: "ApplicationResults",
                columns: new[] { "ApplicationId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationResults_QuestionId",
                table: "ApplicationResults",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_TestApplications_AuthorId",
                table: "TestApplications",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_TestApplications_TestId",
                table: "TestApplications",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_TestApplications_Token",
                table: "TestApplications",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationResults");

            migrationBuilder.DropTable(
                name: "TestApplications");
        }
    }
}
