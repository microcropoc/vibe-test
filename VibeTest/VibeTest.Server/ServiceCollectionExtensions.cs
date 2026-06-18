using Microsoft.Extensions.DependencyInjection;
using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Services;

namespace VibeTest.Server;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Регистрация доменного слоя. Вызывать из Program.cs на Этапе 2+.
    /// На Этапе 1 сервисы тестируются напрямую в интеграционных тестах.
    /// </summary>
    public static IServiceCollection AddVibeTestServices(this IServiceCollection services)
    {
        services.AddScoped<ITestRepository, TestRepository>();
        services.AddScoped<IQuestionAnswerRepository, QuestionAnswerRepository>();
        services.AddScoped<IResultRepository, ResultRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        services.AddScoped<ITestService, TestService>();
        services.AddScoped<IResultService, ResultService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
