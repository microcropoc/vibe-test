using System.Text.Json;
using System.Text.Json.Serialization;
using VibeTest.Server;

var builder = WebApplication.CreateBuilder(args);

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

public partial class Program;
