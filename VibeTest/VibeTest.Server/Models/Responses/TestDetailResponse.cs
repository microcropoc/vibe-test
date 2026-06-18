namespace VibeTest.Server.Models.Responses;

public class TestDetailResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public List<QuestionDetailDto> Questions { get; set; } = [];
}

public class QuestionDetailDto
{
    public int Order { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<AnswerDetailDto> Answers { get; set; } = [];
}

public class AnswerDetailDto
{
    public int Order { get; set; }
    public string Text { get; set; } = string.Empty;
}
