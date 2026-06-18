using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Data;
using VibeTest.Server.Middleware;

namespace VibeTest.Server;

public static class WebApplicationExtensions
{
    public static WebApplication UseVibeTestPipeline(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            if (app.Environment.IsEnvironment("Testing"))
                db.Database.EnsureCreated();
            else
                db.Database.Migrate();
        }

        app.UseMiddleware<DomainExceptionMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseCors("Spa");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        if (app.Environment.IsDevelopment())
        {
            app.UseDefaultFiles();
            app.MapStaticAssets();
            app.MapFallbackToFile("/index.html");
        }

        return app;
    }
}
