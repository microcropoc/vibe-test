namespace VibeTest.Server.Models.Responses;

public class UserStatsResponse
{
    public int TotalCreated { get; set; }
    public int TotalPublished { get; set; }
    public int TotalPassedOwn { get; set; }
    public int TotalPassedOthers { get; set; }
    public double AverageScoreOwn { get; set; }
    public double AverageScoreOthers { get; set; }
}
