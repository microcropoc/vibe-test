using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class UserService : IUserService
{
    public Task<UserStatsResponse> GetStats(int userId) =>
        throw new NotImplementedException();
}
