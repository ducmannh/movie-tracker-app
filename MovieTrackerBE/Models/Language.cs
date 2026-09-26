namespace MovieTrackerBE.Models;

public class Language
{
    public int Id { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
