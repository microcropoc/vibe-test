namespace VibeTest.Server.Models.Entities;

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;

    public ICollection<TestQuestionAnswer> TestQuestionAnswers { get; set; } = [];
    public ICollection<Result> Results { get; set; } = [];
}
