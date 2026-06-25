using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using VibeTest.Server.Configuration;
using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class AuthService(
    IAuthRepository auth,
    IPasswordHasher<User> passwordHasher,
    IOptions<JwtOptions> jwtOptions,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        logger.LogDebug("Register attempt for email {Email}", request.Email);

        ValidateCredentials(request.Email, request.Password, request.DisplayName);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await auth.GetByEmailAsync(normalizedEmail) is not null)
            throw new ValidationException("Email уже зарегистрирован");

        var user = new User
        {
            DisplayName = request.DisplayName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordHasher.HashPassword(null!, request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await auth.AddUserAsync(user);
        await auth.SaveChangesAsync();

        logger.LogInformation("User registered: {UserId} ({Email})", user.Id, normalizedEmail);

        return await IssueAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        logger.LogDebug("Login attempt for email {Email}", request.Email);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            throw new ValidationException("Email и пароль обязательны");

        var user = await auth.GetByEmailAsync(request.Email.Trim().ToLowerInvariant());
        if (user is null || passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
            == PasswordVerificationResult.Failed)
        {
            logger.LogWarning("Failed login for email {Email}", request.Email);
            throw new UnauthorizedException("Неверный email или пароль");
        }

        logger.LogInformation("User logged in: {UserId}", user.Id);

        return await IssueAuthResponseAsync(user);
    }

    public async Task<TokenRefreshResponse> RefreshAsync(RefreshTokenRequest request)
    {
        logger.LogDebug("Refresh token request");

        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            throw new ValidationException("Refresh token обязателен");

        var tokenValue = request.RefreshToken.Trim();

        var stored = await auth.GetRefreshTokenAsync(tokenValue)
            ?? throw new UnauthorizedException("Недействительный refresh token");

        if (stored.ExpiresAt <= DateTime.UtcNow)
        {
            await auth.DeleteRefreshTokenByValueAsync(tokenValue);
            logger.LogWarning("Expired refresh token for user {UserId}", stored.UserId);
            throw new UnauthorizedException("Refresh token истёк");
        }

        var deleted = await auth.DeleteRefreshTokenByValueAsync(tokenValue);
        if (deleted == 0)
        {
            logger.LogWarning("Refresh token already used for user {UserId}", stored.UserId);
            throw new UnauthorizedException("Refresh token уже использован");
        }

        var (accessToken, expiresAt) = CreateAccessToken(stored.User);
        var refreshToken = await CreateRefreshTokenAsync(stored.User);

        logger.LogInformation("Tokens refreshed for user {UserId}", stored.UserId);

        return new TokenRefreshResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };
    }

    public async Task<UserDto> GetMeAsync(int userId)
    {
        logger.LogDebug("GetMe for user {UserId}", userId);

        var user = await auth.GetByIdAsync(userId)
            ?? throw new NotFoundException("Пользователь не найден");

        return MapUser(user);
    }

    private async Task<AuthResponse> IssueAuthResponseAsync(User user)
    {
        var (accessToken, expiresAt) = CreateAccessToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = MapUser(user)
        };
    }

    private (string Token, DateTime ExpiresAt) CreateAccessToken(User user)
    {
        if (string.IsNullOrWhiteSpace(_jwt.Key) || _jwt.Key.Length < 32)
            throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private async Task<string> CreateRefreshTokenAsync(User user)
    {
        var token = new RefreshToken
        {
            UserId = user.Id,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays)
        };

        await auth.AddRefreshTokenAsync(token);
        await auth.SaveChangesAsync();

        return token.Token;
    }

    private static void ValidateCredentials(string email, string password, string displayName)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ValidationException("Email обязателен");
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            throw new ValidationException("Пароль должен быть не короче 8 символов");
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ValidationException("Имя обязательно");
    }

    private static UserDto MapUser(User user) => new()
    {
        Id = user.Id,
        DisplayName = user.DisplayName,
        Email = user.Email
    };
}
