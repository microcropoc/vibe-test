using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Models.Requests;

public class CreateApplicationRequest
{
    public string Title { get; set; } = string.Empty;
    public ApplicationType Type { get; set; } = ApplicationType.Link;
    public int TestId { get; set; }
    public bool HideResultsFromParticipant { get; set; }
    public int? RecipientUserId { get; set; }
}
