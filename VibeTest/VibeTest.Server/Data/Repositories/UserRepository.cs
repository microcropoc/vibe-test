using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Data.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<bool> ExistsAsync(int userId, CancellationToken cancellationToken = default) =>
        db.Users.AnyAsync(u => u.Id == userId, cancellationToken);

    public Task<string?> GetDisplayNameAsync(int userId, CancellationToken cancellationToken = default) =>
        db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.DisplayName)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<List<UserSearchResult>> SearchAsync(
        string query,
        int excludeUserId,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var lower = query.ToLower();

        return db.Users
            .Where(u => u.Id != excludeUserId
                && (u.DisplayName.ToLower().Contains(lower) || u.Email.ToLower().Contains(lower)))
            .OrderBy(u => u.DisplayName)
            .Take(limit)
            .Select(u => new UserSearchResult { Id = u.Id, DisplayName = u.DisplayName })
            .ToListAsync(cancellationToken);
    }

    public Task<UserStatsRow> GetStatsAsync(int userId, CancellationToken cancellationToken = default) =>
        db.Database
            .SqlQueryRaw<UserStatsRow>(
                """
                SELECT
                    (SELECT COUNT(*) FROM Tests WHERE AuthorId = {0}) AS TotalCreated,
                    (SELECT COUNT(*) FROM Tests WHERE AuthorId = {0} AND IsPublic = 1) AS TotalPublished,
                    (
                        SELECT COUNT(*)
                        FROM UserTestResults utr
                        INNER JOIN Tests t ON t.Id = utr.TestId AND t.AuthorId = {0}
                        WHERE utr.UserId = {0}
                          AND t.QuestionsCount > 0
                          AND utr.CorrectAnswer + utr.IncorrectAnswer = t.QuestionsCount
                    ) AS TotalPassedOwn,
                    (
                        SELECT COUNT(*)
                        FROM UserTestResults utr
                        INNER JOIN Tests t ON t.Id = utr.TestId AND t.AuthorId <> {0}
                        WHERE utr.UserId = {0}
                          AND t.QuestionsCount > 0
                          AND utr.CorrectAnswer + utr.IncorrectAnswer = t.QuestionsCount
                    ) AS TotalPassedOthers,
                    COALESCE((
                        SELECT AVG(CAST(utr.CorrectAnswer AS REAL) / t.QuestionsCount * 100.0)
                        FROM UserTestResults utr
                        INNER JOIN Tests t ON t.Id = utr.TestId AND t.AuthorId = {0}
                        WHERE utr.UserId = {0}
                          AND t.QuestionsCount > 0
                          AND utr.CorrectAnswer + utr.IncorrectAnswer = t.QuestionsCount
                    ), 0.0) AS AverageScoreOwn,
                    COALESCE((
                        SELECT AVG(CAST(utr.CorrectAnswer AS REAL) / t.QuestionsCount * 100.0)
                        FROM UserTestResults utr
                        INNER JOIN Tests t ON t.Id = utr.TestId AND t.AuthorId <> {0}
                        WHERE utr.UserId = {0}
                          AND t.QuestionsCount > 0
                          AND utr.CorrectAnswer + utr.IncorrectAnswer = t.QuestionsCount
                    ), 0.0) AS AverageScoreOthers
                """,
                userId)
            .FirstAsync(cancellationToken);
}
