using System.Text.Json;
using System.Text.Json.Serialization;
using Serilog;
using VibeTest.Server;

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(
                new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        });
    builder.Services.AddOpenApi();
    builder.Services.AddVibeTestServices(builder.Configuration);

    var app = builder.Build();
    app.UseVibeTestPipeline();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Приложение завершилось с ошибкой");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program;
