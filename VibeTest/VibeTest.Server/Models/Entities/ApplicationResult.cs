namespace VibeTest.Server.Models.Entities;

public class ApplicationResult
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
    public DateTime AnsweredAt { get; set; }

    public TestApplication Application { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public Answer Answer { get; set; } = null!;
}
