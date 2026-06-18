namespace VibeTest.Server.Models.Entities;

public class TestQuestionAnswer
{
    public int Id { get; set; }
    public int TestId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
    public int QuestionOrder { get; set; }
    public int AnswerOrder { get; set; }
    public bool IsCorrect { get; set; }

    public Test Test { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public Answer Answer { get; set; } = null!;
}
