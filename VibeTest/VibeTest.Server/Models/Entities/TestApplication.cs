namespace VibeTest.Server.Models.Entities;

public class TestApplication
{
    public int Id { get; set; }
    public Guid Token { get; set; }
    public int AuthorId { get; set; }
    public int TestId { get; set; }
    public string ParticipantName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool HideResultsFromParticipant { get; set; }

    public User Author { get; set; } = null!;
    public Test Test { get; set; } = null!;
    public ICollection<ApplicationResult> Results { get; set; } = [];
}
