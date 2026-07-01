using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public class ResultRepository(AppDbContext db) : IResultRepository
{
    private const string HistoryBaseCte = """
        WITH attempt_scores AS (
            SELECT
                utr.TestId,
                t.Name AS TestName,
                t.QuestionsCount AS TotalQuestions,
                utr.CorrectAnswer AS CorrectAnswers,
                CAST(utr.CorrectAnswer AS REAL) / t.QuestionsCount * 100.0 AS ScorePercent,
                (
                    SELECT MAX(r.AnsweredAt)
                    FROM Results r
                    WHERE r.UserId = utr.UserId AND r.TestId = utr.TestId
                ) AS CompletedAt
            FROM UserTestResults utr
            INNER JOIN Tests t ON t.Id = utr.TestId
            WHERE utr.UserId = {0}
              AND t.QuestionsCount > 0
              AND (utr.CorrectAnswer + utr.IncorrectAnswer) > 0
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

    public async Task<string?> GetQuestionExplanationAsync(
        int testId,
        int questionOrder,
        CancellationToken cancellationToken = default)
    {
        var row = await db.TestQuestionAnswers
            .Where(tqa => tqa.TestId == testId
                && tqa.QuestionOrder == questionOrder
                && tqa.AnswerOrder == 0)
            .Select(tqa => tqa.Explanation)
            .FirstOrDefaultAsync(cancellationToken);

        return string.IsNullOrWhiteSpace(row) ? null : row;
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
                    t.QuestionsCount AS TotalQuestions,
                    COALESCE(utr.CorrectAnswer, 0) AS CorrectAnswers,
                    COALESCE(utr.IncorrectAnswer, 0) AS IncorrectAnswers,
                    (
                        SELECT MIN(r.AnsweredAt)
                        FROM Results r
                        WHERE r.UserId = {0} AND r.TestId = {1}
                    ) AS StartedAt,
                    (
                        SELECT MAX(r.AnsweredAt)
                        FROM Results r
                        WHERE r.UserId = {0} AND r.TestId = {1}
                    ) AS CompletedAt
                FROM Tests t
                LEFT JOIN UserTestResults utr
                    ON utr.TestId = t.Id AND utr.UserId = {0}
                WHERE t.Id = {1}
                """,
                userId,
                testId)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task InsertAsync(Result result, CancellationToken cancellationToken = default)
    {
        db.Results.Add(result);
    }

    public Task<UserTestResult?> GetUserTestResultAsync(
        int userId,
        int testId,
        CancellationToken cancellationToken = default) =>
        db.UserTestResults
            .FirstOrDefaultAsync(utr => utr.UserId == userId && utr.TestId == testId, cancellationToken);

    public Task InsertUserTestResultAsync(UserTestResult aggregate, CancellationToken cancellationToken = default)
    {
        db.UserTestResults.Add(aggregate);
        return Task.CompletedTask;
    }

    public async Task DeleteUserTestResultAsync(int userId, int testId, CancellationToken cancellationToken = default)
    {
        await db.Database.ExecuteSqlRawAsync(
            "DELETE FROM UserTestResults WHERE UserId = {0} AND TestId = {1}",
            userId,
            testId);
    }

    public Task<bool> HasAnswerForQuestionAsync(
        int userId,
        int testId,
        int questionId,
        CancellationToken cancellationToken = default) =>
        db.Results.AnyAsync(
            r => r.UserId == userId && r.TestId == testId && r.QuestionId == questionId,
            cancellationToken);

    public Task<List<AnsweredQuestionRow>> GetAnsweredQuestionsAsync(
        int userId,
        int testId,
        CancellationToken cancellationToken = default) =>
        db.Database
            .SqlQueryRaw<AnsweredQuestionRow>(
                """
                SELECT
                    sel.QuestionOrder AS QuestionOrder,
                    sel.AnswerOrder AS SelectedAnswerOrder,
                    correct.AnswerOrder AS CorrectAnswerOrder,
                    sel.IsCorrect AS IsCorrect,
                    expl.Explanation AS Explanation
                FROM Results r
                INNER JOIN TestQuestionAnswers sel
                    ON sel.TestId = r.TestId
                   AND sel.QuestionId = r.QuestionId
                   AND sel.AnswerId = r.AnswerId
                INNER JOIN TestQuestionAnswers correct
                    ON correct.TestId = r.TestId
                   AND correct.QuestionOrder = sel.QuestionOrder
                   AND correct.IsCorrect = 1
                LEFT JOIN TestQuestionAnswers expl
                    ON expl.TestId = r.TestId
                   AND expl.QuestionOrder = sel.QuestionOrder
                   AND expl.AnswerOrder = 0
                WHERE r.UserId = {0} AND r.TestId = {1}
                ORDER BY sel.QuestionOrder
                """,
                userId,
                testId)
            .ToListAsync(cancellationToken);

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
