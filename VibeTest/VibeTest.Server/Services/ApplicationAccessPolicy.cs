using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Services;

internal static class ApplicationAccessPolicy
{
    public static void EnsureCanPlay(TestApplication application, int? currentUserId)
    {
        if (application.Type == ApplicationType.Link)
            return;

        if (application.Type == ApplicationType.InternalUser && currentUserId == application.RecipientUserId)
            return;

        throw new ForbiddenException("Доступ к этой заявке только для назначенного пользователя");
    }
}
