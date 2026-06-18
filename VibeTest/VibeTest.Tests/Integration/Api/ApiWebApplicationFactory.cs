using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using VibeTest.Server.Data;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Tests.Integration.Api;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection;

    public ApiWebApplicationFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    public JsonSerializerOptions JsonOptions { get; } = new()
    {
        PropertyNameCaseInsensitive = true
    };

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<AppDbContext>();

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _connection.Dispose();
        base.Dispose(disposing);
    }

    public async Task<string> RegisterAndGetTokenAsync(HttpClient client, string? email = null)
    {
        email ??= $"user-{Guid.NewGuid():N}@test.com";
        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "password123",
            DisplayName = "Api User"
        });

        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(JsonOptions);
        return auth!.AccessToken;
    }

    public void Authorize(HttpClient client, string accessToken) =>
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    public static async Task<HttpResponseMessage> PatchAsJsonAsync<T>(HttpClient client, string url, T body) =>
        await client.SendAsync(new HttpRequestMessage(HttpMethod.Patch, url)
        {
            Content = JsonContent.Create(body)
        });
}

public sealed class ApiFixture : IAsyncLifetime
{
    public ApiWebApplicationFactory Factory { get; } = new();

    public async Task InitializeAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;
}
