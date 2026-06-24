using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Models.Responses;

public class TestListItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int QuestionsCount { get; set; }
    public bool IsPublic { get; set; }
    public TestDifficulty Difficulty { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class TestResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public TestDifficulty Difficulty { get; set; }
    public int QuestionsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
