namespace VibeTest.Server.Models.Entities;

public class TestApplication
{
    public int Id { get; set; }
    public Guid Token { get; set; }
    public int AuthorId { get; set; }
    public int TestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public ApplicationType Type { get; set; } = ApplicationType.Link;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool HideResultsFromParticipant { get; set; }
    public int? RecipientUserId { get; set; }

    public User Author { get; set; } = null!;
    public User? Recipient { get; set; }
    public Test Test { get; set; } = null!;
    public ICollection<ApplicationResult> Results { get; set; } = [];
}
