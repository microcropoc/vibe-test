using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<TokenRefreshResponse> RefreshAsync(RefreshTokenRequest request);
    Task<UserDto> GetMeAsync(int userId);
}
