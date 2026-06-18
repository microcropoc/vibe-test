namespace VibeTest.Server.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "VibeTest";
    public string Audience { get; set; } = "VibeTest";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}
