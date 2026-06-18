using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public class TestRepository(AppDbContext db) : ITestRepository
{
    public Task<Test?> GetByIdAsync(int testId, CancellationToken cancellationToken = default) =>
        db.Tests.FirstOrDefaultAsync(t => t.Id == testId, cancellationToken);

    public Task<Test?> GetByIdWithStructureAsync(int testId, CancellationToken cancellationToken = default) =>
        db.Tests
            .Include(t => t.Author)
            .Include(t => t.QuestionAnswers)
                .ThenInclude(tqa => tqa.Question)
            .Include(t => t.QuestionAnswers)
                .ThenInclude(tqa => tqa.Answer)
            .FirstOrDefaultAsync(t => t.Id == testId, cancellationToken);

    public async Task AddAsync(Test test, CancellationToken cancellationToken = default) =>
        await db.Tests.AddAsync(test, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
