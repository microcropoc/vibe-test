namespace VibeTest.Server.Models.Responses;

public class ApplicationResponse
{
    public int Id { get; set; }
    public Guid Token { get; set; }
    public string ParticipantName { get; set; } = string.Empty;
    public int TestId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool HideResultsFromParticipant { get; set; }
    public string PlayUrl { get; set; } = string.Empty;
}

public class ApplicationListItem
{
    public int Id { get; set; }
    public Guid Token { get; set; }
    public string ParticipantName { get; set; } = string.Empty;
    public int TestId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsCompleted { get; set; }
    public int CorrectAnswers { get; set; }
    public int TotalQuestions { get; set; }
    public double ScorePercent { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool HideResultsFromParticipant { get; set; }
    public string PlayUrl { get; set; } = string.Empty;
}
