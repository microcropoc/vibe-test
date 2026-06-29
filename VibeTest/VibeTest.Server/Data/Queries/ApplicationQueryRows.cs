namespace VibeTest.Server.Data.Queries;

public class ApplicationListItemRow
{
    public int Id { get; set; }
    public Guid Token { get; set; }
    public string ParticipantName { get; set; } = string.Empty;
    public int TestId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public double ScorePercent { get; set; }
    public bool HideResultsFromParticipant { get; set; }
}

public class ApplicationResultSummaryRow
{
    public int TestId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
