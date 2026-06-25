using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class UserService(IUserRepository users, ILogger<UserService> logger) : IUserService
{
    public async Task<UserStatsResponse> GetStats(int userId)
    {
        logger.LogDebug("GetStats for user {UserId}", userId);

        if (!await users.ExistsAsync(userId))
            throw new NotFoundException("Пользователь не найден");

        var stats = await users.GetStatsAsync(userId);

        logger.LogInformation(
            "Stats retrieved for user {UserId}: created={TotalCreated}, published={TotalPublished}",
            userId,
            stats.TotalCreated,
            stats.TotalPublished);

        return new UserStatsResponse
        {
            TotalCreated = stats.TotalCreated,
            TotalPublished = stats.TotalPublished,
            TotalPassedOwn = stats.TotalPassedOwn,
            TotalPassedOthers = stats.TotalPassedOthers,
            AverageScoreOwn = stats.AverageScoreOwn,
            AverageScoreOthers = stats.AverageScoreOthers
        };
    }
}
