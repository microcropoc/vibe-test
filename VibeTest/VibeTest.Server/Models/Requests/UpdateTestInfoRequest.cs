namespace VibeTest.Server.Models.Requests;

public class UpdateTestInfoRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
