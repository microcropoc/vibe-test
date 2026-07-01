using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTest.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionsCountAndUserTestResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuestionsCount",
                table: "Tests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "UserTestResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    TestId = table.Column<int>(type: "INTEGER", nullable: false),
                    CorrectAnswer = table.Column<int>(type: "INTEGER", nullable: false),
                    IncorrectAnswer = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTestResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTestResults_Tests_TestId",
                        column: x => x.TestId,
                        principalTable: "Tests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTestResults_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserTestResults_TestId",
                table: "UserTestResults",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTestResults_UserId_TestId",
                table: "UserTestResults",
                columns: new[] { "UserId", "TestId" },
                unique: true);

            migrationBuilder.Sql(
                """
                UPDATE Tests
                SET QuestionsCount = (
                    SELECT COUNT(DISTINCT QuestionOrder)
                    FROM TestQuestionAnswers
                    WHERE TestId = Tests.Id
                )
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO UserTestResults (UserId, TestId, CorrectAnswer, IncorrectAnswer)
                SELECT
                    r.UserId,
                    r.TestId,
                    SUM(CASE WHEN sel.IsCorrect = 1 THEN 1 ELSE 0 END),
                    SUM(CASE WHEN sel.IsCorrect = 0 THEN 1 ELSE 0 END)
                FROM Results r
                INNER JOIN TestQuestionAnswers sel
                    ON sel.TestId = r.TestId
                   AND sel.QuestionId = r.QuestionId
                   AND sel.AnswerId = r.AnswerId
                GROUP BY r.UserId, r.TestId
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTestResults");

            migrationBuilder.DropColumn(
                name: "QuestionsCount",
                table: "Tests");
        }
    }
}
