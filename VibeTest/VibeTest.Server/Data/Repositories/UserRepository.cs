using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Data.Queries;

namespace VibeTest.Server.Data.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<bool> ExistsAsync(int userId, CancellationToken cancellationToken = default) =>
        db.Users.AnyAsync(u => u.Id == userId, cancellationToken);

    public Task<UserStatsRow> GetStatsAsync(int userId, CancellationToken cancellationToken = default) =>
        db.Database
            .SqlQueryRaw<UserStatsRow>(
                """
                SELECT
                    (SELECT COUNT(*) FROM Tests WHERE AuthorId = {0}) AS TotalCreated,
                    (SELECT COUNT(*) FROM Tests WHERE AuthorId = {0} AND IsPublic = 1) AS TotalPublished,
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT r.TestId
                            FROM Results r
                            INNER JOIN Tests t ON t.Id = r.TestId AND t.AuthorId = {0}
                            INNER JOIN (
                                SELECT TestId, COUNT(DISTINCT QuestionOrder) AS QuestionCount
                                FROM TestQuestionAnswers
                                GROUP BY TestId
                            ) qc ON qc.TestId = r.TestId
                            WHERE r.UserId = {0}
                            GROUP BY r.TestId, qc.QuestionCount
                            HAVING COUNT(r.Id) = qc.QuestionCount
                        ) passed
                    ) AS TotalPassedOwn,
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT r.TestId
                            FROM Results r
                            INNER JOIN Tests t ON t.Id = r.TestId AND t.AuthorId <> {0}
                            INNER JOIN (
                                SELECT TestId, COUNT(DISTINCT QuestionOrder) AS QuestionCount
                                FROM TestQuestionAnswers
                                GROUP BY TestId
                            ) qc ON qc.TestId = r.TestId
                            WHERE r.UserId = {0}
                            GROUP BY r.TestId, qc.QuestionCount
                            HAVING COUNT(r.Id) = qc.QuestionCount
                        ) passed
                    ) AS TotalPassedOthers,
                    COALESCE((
                        SELECT AVG(score)
                        FROM (
                            SELECT
                                CAST(SUM(CASE WHEN sel.IsCorrect = 1 THEN 1 ELSE 0 END) AS REAL)
                                    / qc.QuestionCount * 100.0 AS score
                            FROM Results r
                            INNER JOIN Tests t ON t.Id = r.TestId AND t.AuthorId = {0}
                            INNER JOIN (
                                SELECT TestId, COUNT(DISTINCT QuestionOrder) AS QuestionCount
                                FROM TestQuestionAnswers
                                GROUP BY TestId
                            ) qc ON qc.TestId = r.TestId
                            INNER JOIN TestQuestionAnswers sel
                                ON sel.TestId = r.TestId
                               AND sel.QuestionId = r.QuestionId
                               AND sel.AnswerId = r.AnswerId
                            WHERE r.UserId = {0}
                            GROUP BY r.TestId, qc.QuestionCount
                            HAVING COUNT(r.Id) = qc.QuestionCount
                        ) scores
                    ), 0.0) AS AverageScoreOwn,
                    COALESCE((
                        SELECT AVG(score)
                        FROM (
                            SELECT
                                CAST(SUM(CASE WHEN sel.IsCorrect = 1 THEN 1 ELSE 0 END) AS REAL)
                                    / qc.QuestionCount * 100.0 AS score
                            FROM Results r
                            INNER JOIN Tests t ON t.Id = r.TestId AND t.AuthorId <> {0}
                            INNER JOIN (
                                SELECT TestId, COUNT(DISTINCT QuestionOrder) AS QuestionCount
                                FROM TestQuestionAnswers
                                GROUP BY TestId
                            ) qc ON qc.TestId = r.TestId
                            INNER JOIN TestQuestionAnswers sel
                                ON sel.TestId = r.TestId
                               AND sel.QuestionId = r.QuestionId
                               AND sel.AnswerId = r.AnswerId
                            WHERE r.UserId = {0}
                            GROUP BY r.TestId, qc.QuestionCount
                            HAVING COUNT(r.Id) = qc.QuestionCount
                        ) scores
                    ), 0.0) AS AverageScoreOthers
                """,
                userId)
            .FirstAsync(cancellationToken);
}
