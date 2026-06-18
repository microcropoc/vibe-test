using System.Security.Claims;

namespace VibeTest.Server.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(value) || !int.TryParse(value, out var userId))
            throw new InvalidOperationException("User id claim is missing.");
        return userId;
    }
}
