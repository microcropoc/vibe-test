using System.Text.Json;
using VibeTest.Server.Exceptions;

namespace VibeTest.Server.Middleware;

public class DomainExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (DomainException ex)
        {
            var statusCode = ex switch
            {
                NotFoundException => StatusCodes.Status404NotFound,
                ForbiddenException => StatusCodes.Status403Forbidden,
                ValidationException => StatusCodes.Status400BadRequest,
                UnauthorizedException => StatusCodes.Status401Unauthorized,
                _ => StatusCodes.Status500InternalServerError
            };

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
    }
}
