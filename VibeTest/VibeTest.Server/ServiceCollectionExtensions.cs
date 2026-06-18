using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VibeTest.Server.Configuration;
using VibeTest.Server.Data;
using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Services;

namespace VibeTest.Server;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddVibeTestServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection") ?? "Data Source=vibetest.db"));

        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<ITestRepository, TestRepository>();
        services.AddScoped<IQuestionAnswerRepository, QuestionAnswerRepository>();
        services.AddScoped<IResultRepository, ResultRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITestService, TestService>();
        services.AddScoped<IResultService, ResultService>();
        services.AddScoped<IUserService, UserService>();

        var jwt = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration is missing.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        services.AddAuthorization();

        services.AddCors(options =>
        {
            options.AddPolicy("Spa", policy =>
            {
                policy.WithOrigins(
                        "https://localhost:64028",
                        "http://localhost:5173",
                        "http://localhost:64028")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
