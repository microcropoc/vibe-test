using VibeTest.Server.Data.Queries;

namespace VibeTest.Server.Data.Repositories;

public interface IUserRepository
{
    Task<bool> ExistsAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserStatsRow> GetStatsAsync(int userId, CancellationToken cancellationToken = default);
}
