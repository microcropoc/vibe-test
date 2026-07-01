namespace VibeTest.Server.Models.Entities;

public class UserTestResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TestId { get; set; }
    public int CorrectAnswer { get; set; }
    public int IncorrectAnswer { get; set; }

    public User User { get; set; } = null!;
    public Test Test { get; set; } = null!;
}
