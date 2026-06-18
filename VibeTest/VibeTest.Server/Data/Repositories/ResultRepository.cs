using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public class ResultRepository(AppDbContext db) : IResultRepository
{
    public Task<List<Result>> GetByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default) =>
        db.Results
            .Where(r => r.UserId == userId && r.TestId == testId)
            .ToListAsync(cancellationToken);

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
        var results = await GetByUserAndTestAsync(userId, testId, cancellationToken);
        db.Results.RemoveRange(results);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
