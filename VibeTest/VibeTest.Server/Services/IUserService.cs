using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public interface IUserService
{
    Task<UserStatsResponse> GetStats(int userId);
}
