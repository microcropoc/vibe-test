using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public class ResultRepository(AppDbContext db) : IResultRepository
{
    private const string HistoryBaseCte = """
        WITH question_counts AS (
            SELECT TestId, COUNT(DISTINCT QuestionOrder) AS QuestionCount
            FROM TestQuestionAnswers
            GROUP BY TestId
        ),
        attempt_scores AS (
            SELECT
                r.TestId,
                t.Name AS TestName,
                qc.QuestionCount AS TotalQuestions,
                SUM(CASE WHEN sel.IsCorrect = 1 THEN 1 ELSE 0 END) AS CorrectAnswers,
                CAST(SUM(CASE WHEN sel.IsCorrect = 1 THEN 1 ELSE 0 END) AS REAL)
                    / qc.QuestionCount * 100.0 AS ScorePercent,
                MAX(r.AnsweredAt) AS CompletedAt
            FROM Results r
            INNER JOIN Tests t ON t.Id = r.TestId
            INNER JOIN question_counts qc ON qc.TestId = r.TestId
            INNER JOIN TestQuestionAnswers sel
                ON sel.TestId = r.TestId
               AND sel.QuestionId = r.QuestionId
               AND sel.AnswerId = r.AnswerId
            WHERE r.UserId = {0}
            GROUP BY r.TestId, t.Name, qc.QuestionCount
            HAVING COUNT(r.Id) > 0
        )
        """;

    public Task<List<Result>> GetByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default) =>
        db.Results
            .Where(r => r.UserId == userId && r.TestId == testId)
            .ToListAsync(cancellationToken);

    public Task<TestQuestionAnswer?> GetTqaByOrdersAsync(
        int testId,
        int questionOrder,
        int answerOrder,
        CancellationToken cancellationToken = default) =>
        db.TestQuestionAnswers
            .FirstOrDefaultAsync(
                tqa => tqa.TestId == testId
                    && tqa.QuestionOrder == questionOrder
                    && tqa.AnswerOrder == answerOrder,
                cancellationToken);

    public async Task<int?> GetCorrectAnswerOrderAsync(int testId, int questionOrder, CancellationToken cancellationToken = default)
    {
        var row = await db.Database
            .SqlQueryRaw<ScalarIntRow>(
                """
                SELECT AnswerOrder AS Value
                FROM TestQuestionAnswers
                WHERE TestId = {0}
                  AND QuestionOrder = {1}
                  AND IsCorrect = 1
                LIMIT 1
                """,
                testId,
                questionOrder)
            .FirstOrDefaultAsync(cancellationToken);

        return row?.Value;
    }

    public Task<TestResultSummaryRow?> GetTestResultSummaryAsync(
        int userId,
        int testId,
        CancellationToken cancellationToken = default) =>
        db.Database
            .SqlQueryRaw<TestResultSummaryRow>(
                """
                SELECT
                    t.Id AS TestId,
                    t.Name AS TestName,
                    (
                        SELECT COUNT(DISTINCT QuestionOrder)
                        FROM TestQuestionAnswers
                        WHERE TestId = {1}
                    ) AS TotalQuestions,
                    COALESCE(SUM(CASE WHEN sel.IsCorrect = 1 THEN 1 ELSE 0 END), 0) AS CorrectAnswers,
                    COALESCE(SUM(CASE WHEN sel.IsCorrect = 0 THEN 1 ELSE 0 END), 0) AS IncorrectAnswers,
                    MIN(r.AnsweredAt) AS StartedAt,
                    MAX(r.AnsweredAt) AS CompletedAt
                FROM Tests t
                LEFT JOIN Results r
                    ON r.TestId = t.Id AND r.UserId = {0}
                LEFT JOIN TestQuestionAnswers sel
                    ON sel.TestId = r.TestId
                   AND sel.QuestionId = r.QuestionId
                   AND sel.AnswerId = r.AnswerId
                WHERE t.Id = {1}
                GROUP BY t.Id, t.Name
                """,
                userId,
                testId)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task UpsertAsync(Result result, CancellationToken cancellationToken = default)
    {
        var existing = await db.Results.FirstOrDefaultAsync(
            r => r.UserId == result.UserId && r.TestId == result.TestId && r.QuestionId == result.QuestionId,
            cancellationToken);

        if (existing is null)
        {
            db.Results.Add(result);
            return;
        }

        existing.AnswerId = result.AnswerId;
        existing.AnsweredAt = result.AnsweredAt;
    }

    public async Task DeleteByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default)
    {
        await db.Database.ExecuteSqlRawAsync(
            "DELETE FROM Results WHERE UserId = {0} AND TestId = {1}",
            userId,
            testId);
    }

    public async Task<int> CountUserHistoryAsync(int userId, CancellationToken cancellationToken = default)
    {
        var row = await db.Database
            .SqlQueryRaw<ScalarIntRow>(
                HistoryBaseCte + "SELECT COUNT(*) AS Value FROM attempt_scores",
                userId)
            .FirstAsync(cancellationToken);

        return row.Value;
    }

    public Task<List<TestHistoryRow>> GetUserHistoryPageAsync(
        int userId,
        string sortBy,
        string order,
        int offset,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var sortColumn = sortBy == "score" ? "ScorePercent" : "CompletedAt";
        var sortDirection = order == "asc" ? "ASC" : "DESC";

        var sql = HistoryBaseCte +
                  """
                  SELECT
                      TestId,
                      TestName,
                      TotalQuestions,
                      CorrectAnswers,
                      ScorePercent,
                      CompletedAt
                  FROM attempt_scores
                  ORDER BY 
                  """ + sortColumn + " " + sortDirection + """

                  LIMIT {1} OFFSET {2}
                  """;

        return db.Database
            .SqlQueryRaw<TestHistoryRow>(sql, userId, pageSize, offset)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
