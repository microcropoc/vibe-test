using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class UserService(IUserRepository users) : IUserService
{
    public async Task<UserStatsResponse> GetStats(int userId)
    {
        if (!await users.ExistsAsync(userId))
            throw new NotFoundException("Пользователь не найден");

        var stats = await users.GetStatsAsync(userId);

        return new UserStatsResponse
        {
            TotalCreated = stats.TotalCreated,
            TotalPublished = stats.TotalPublished,
            TotalPassed = stats.TotalPassed,
            AverageScore = stats.AverageScore
        };
    }
}
