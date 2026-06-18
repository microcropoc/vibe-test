using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface IResultRepository
{
    Task<List<Result>> GetByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default);
    Task UpsertAsync(Result result, CancellationToken cancellationToken = default);
    Task DeleteByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
