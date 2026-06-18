using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VibeTest.Server.Extensions;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;
using VibeTest.Server.Services;

namespace VibeTest.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public Task<AuthResponse> Register([FromBody] RegisterRequest request) =>
        authService.RegisterAsync(request);

    [HttpPost("login")]
    [AllowAnonymous]
    public Task<AuthResponse> Login([FromBody] LoginRequest request) =>
        authService.LoginAsync(request);

    [HttpPost("refresh")]
    [AllowAnonymous]
    public Task<TokenRefreshResponse> Refresh([FromBody] RefreshTokenRequest request) =>
        authService.RefreshAsync(request);

    [HttpGet("me")]
    [Authorize]
    public Task<UserDto> Me() =>
        authService.GetMeAsync(User.GetUserId());
}
