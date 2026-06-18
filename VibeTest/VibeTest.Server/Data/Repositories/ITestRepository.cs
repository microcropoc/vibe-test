using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface ITestRepository
{
    Task<Test?> GetByIdAsync(int testId, CancellationToken cancellationToken = default);
    Task<Test?> GetByIdWithStructureAsync(int testId, CancellationToken cancellationToken = default);
    Task AddAsync(Test test, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
