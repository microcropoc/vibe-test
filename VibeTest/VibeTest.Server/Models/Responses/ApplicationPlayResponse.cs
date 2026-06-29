namespace VibeTest.Server.Models.Responses;

public class ApplicationPlayResponse
{
    public string ParticipantName { get; set; } = string.Empty;
    public bool HideResultsFromParticipant { get; set; }
    public bool IsCompleted { get; set; }
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public List<QuestionDetailDto> Questions { get; set; } = [];
}
