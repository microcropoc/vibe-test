namespace VibeTest.Server.Models.Responses;

public class TestFullResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public List<QuestionFullDto> Questions { get; set; } = [];
}

public class QuestionFullDto
{
    public int Order { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<string> Answers { get; set; } = [];
    public int Correct { get; set; }
}
