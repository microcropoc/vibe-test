namespace VibeTest.Server.Models.Requests;

public class CreateApplicationRequest
{
    public string ParticipantName { get; set; } = string.Empty;
    public int TestId { get; set; }
    public bool HideResultsFromParticipant { get; set; }
}
