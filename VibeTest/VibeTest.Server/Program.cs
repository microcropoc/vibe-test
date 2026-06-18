var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// В режиме full фронтенд собирается в vibetest.client/dist и раздаётся сервером.
// Guest SPA деплоится отдельно (GitHub Pages) и не использует этот хост.
if (app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();
    app.MapStaticAssets();
    app.MapFallbackToFile("/index.html");
}

app.Run();
