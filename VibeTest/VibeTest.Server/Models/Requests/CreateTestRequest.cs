namespace VibeTest.Server.Models.Requests;

public class CreateTestRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<QuestionInput> Questions { get; set; } = [];
}

public class QuestionInput
{
    public string Text { get; set; } = string.Empty;
    public List<string> Answers { get; set; } = [];
    public int Correct { get; set; }
    public string? Explanation { get; set; }
}
