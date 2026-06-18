namespace VibeTest.Server.Models.Responses;

public class UserStatsResponse
{
    public int TotalCreated { get; set; }
    public int TotalPublished { get; set; }
    public int TotalPassed { get; set; }
    public double AverageScore { get; set; }
}
