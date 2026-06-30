using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Data.Repositories;

public interface IUserRepository
{
    Task<bool> ExistsAsync(int userId, CancellationToken cancellationToken = default);
    Task<string?> GetDisplayNameAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<UserSearchResult>> SearchAsync(
        string query,
        int excludeUserId,
        int limit,
        CancellationToken cancellationToken = default);
    Task<UserStatsRow> GetStatsAsync(int userId, CancellationToken cancellationToken = default);
}
