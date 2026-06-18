namespace VibeTest.Server.Models.Entities;

public class User
{
    public int Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<Test> AuthoredTests { get; set; } = [];
    public ICollection<Result> Results { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
