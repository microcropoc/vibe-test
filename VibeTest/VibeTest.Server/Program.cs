using VibeTest.Server;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddVibeTestServices(builder.Configuration);

var app = builder.Build();
app.UseVibeTestPipeline();
app.Run();

public partial class Program;
