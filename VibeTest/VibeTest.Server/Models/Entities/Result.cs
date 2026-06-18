namespace VibeTest.Server.Models.Entities;

public class Result
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TestId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
    public DateTime AnsweredAt { get; set; }

    public User User { get; set; } = null!;
    public Test Test { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public Answer Answer { get; set; } = null!;
}
