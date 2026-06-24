using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Models.Requests;

public class UpdateTestInfoRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TestDifficulty? Difficulty { get; set; }
}
